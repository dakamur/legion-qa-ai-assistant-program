#!/usr/bin/env node
/**
 * afterFileEdit guard for tests/** — blocks weakened Playwright assertions.
 * Exit 0: allow. Exit 2: block (assertion deleted or commented out).
 */
import fs from 'node:fs';
import path from 'node:path';

const TEST_FILE_PATTERN = /(?:^|[\\/])tests[\\/]/;

function readStdin() {
  return fs.readFileSync(0, 'utf8');
}

function isTestFile(filePath) {
  const normalized = path.normalize(filePath).replace(/\\/g, '/');
  return TEST_FILE_PATTERN.test(normalized);
}

function countRawExpects(content) {
  return (content.match(/expect\(/g) ?? []).length;
}

function hasActiveExpectOnLine(line) {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('//') || trimmed.startsWith('*')) {
    return false;
  }
  const withoutInlineComment = line.replace(/\/\/.*$/, '');
  return /expect\(/.test(withoutInlineComment);
}

function countActiveExpects(content) {
  let count = 0;
  for (const line of content.split('\n')) {
    if (!hasActiveExpectOnLine(line)) {
      continue;
    }
    const withoutInlineComment = line.replace(/\/\/.*$/, '');
    count += (withoutInlineComment.match(/expect\(/g) ?? []).length;
  }
  return count;
}

function reconstructBefore(afterContent, edits) {
  let before = afterContent;
  for (let i = edits.length - 1; i >= 0; i -= 1) {
    const { old_string: oldString, new_string: newString } = edits[i];
    if (!before.includes(newString)) {
      throw new Error('Could not reverse edit: new_string not found in file');
    }
    before = before.replace(newString, oldString);
  }
  return before;
}

function findCommentedOutExpects(before, after) {
  const commented = [];
  const beforeActiveLines = before.split('\n').filter(hasActiveExpectOnLine);

  for (const beforeLine of beforeActiveLines) {
    const normalized = beforeLine.trim();
    const afterHasActive = after.split('\n').some((line) => {
      if (!hasActiveExpectOnLine(line)) {
        return false;
      }
      return line.trim() === normalized || line.includes(normalized);
    });
    if (afterHasActive) {
      continue;
    }

    const expectFragment = normalized.match(/expect\([^)]*\)/)?.[0];
    if (!expectFragment) {
      continue;
    }

    const commentedLine = after.split('\n').find((line) => {
      const trimmed = line.trimStart();
      return (
        (trimmed.startsWith('//') || /^\s*\/\//.test(line)) &&
        line.includes(expectFragment)
      );
    });

    if (commentedLine) {
      commented.push(commentedLine.trim());
    }
  }

  return commented;
}

function deny(message, details) {
  const payload = {
    permission: 'deny',
    user_message: message,
    agent_message: details,
  };
  process.stderr.write(`${message}\n`);
  process.stdout.write(`${JSON.stringify(payload)}\n`);
  process.exit(2);
}

function main() {
  let input;
  try {
    input = JSON.parse(readStdin());
  } catch (error) {
    process.stderr.write(`guard-test-assertions: invalid stdin JSON: ${error.message}\n`);
    process.exit(1);
  }

  const filePath = input.file_path;
  const edits = input.edits ?? [];

  if (!filePath || !isTestFile(filePath)) {
    process.exit(0);
  }

  let afterContent;
  try {
    afterContent = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    process.stderr.write(`guard-test-assertions: cannot read ${filePath}: ${error.message}\n`);
    process.exit(1);
  }

  let beforeContent;
  try {
    beforeContent = reconstructBefore(afterContent, edits);
  } catch (error) {
    process.stderr.write(`guard-test-assertions: ${error.message}\n`);
    process.exit(1);
  }

  const rawBefore = countRawExpects(beforeContent);
  const rawAfter = countRawExpects(afterContent);
  const activeBefore = countActiveExpects(beforeContent);
  const activeAfter = countActiveExpects(afterContent);
  const commentedOut = findCommentedOutExpects(beforeContent, afterContent);

  if (rawAfter < rawBefore) {
    deny(
      'Test assertion guard: edit removed expect() calls.',
      `Blocked weakening edit in ${filePath}. expect( count dropped from ${rawBefore} to ${rawAfter}. Do not delete assertions to greenwash failures — fix the root cause or file a bug.`,
    );
  }

  if (activeAfter < activeBefore) {
    deny(
      'Test assertion guard: edit disabled expect() assertions.',
      `Blocked weakening edit in ${filePath}. Active expect lines dropped from ${activeBefore} to ${activeAfter}.`,
    );
  }

  if (commentedOut.length > 0) {
    deny(
      'Test assertion guard: edit commented out expect() calls.',
      `Blocked weakening edit in ${filePath}. Commented assertions: ${commentedOut.join(' | ')}`,
    );
  }

  process.exit(0);
}

main();
