import {FileCreate, FileOperations, JSONPatch, Utility} from "../src/main";
import {TaskRoot} from "@codesweets/core";
import assert from "assert";
import fs from "fs";

(async () => {
  const root = await TaskRoot.create();
  fs.writeFileSync("/test1.txt", "hello 123 world");
  fs.writeFileSync("/test2.txt", "hello 123 world");
  fs.writeFileSync("/test3.log", "hello 123 world");

  new FileCreate(root, {
    content: "hello 123 world",
    path: "/test4.txt"
  });
  new FileOperations(root, {
    operations: [
      {
        content: "before_",
        operation: "prepend"
      },
      {
        content: "_after",
        operation: "append"
      },
      {
        content: "<<",
        find_regex: "123",
        operation: "prepend"
      },
      {
        content: ">>",
        find_regex: "123",
        operation: "append"
      },
      {
        content: "456",
        find_regex: "123",
        operation: "replace"
      }
    ],
    path: "/*.txt",
    path_type: "glob"
  });
  new FileCreate(root, {
    content: "{\"name\":\"Bob\"}",
    path: "/test.json"
  });
  new JSONPatch(root, {
    patch: "[{ \"op\": \"replace\", \"path\": \"/name\", \"value\": \"Sally\" }]",
    path: "/test.json"
  });

  await root.run();
  assert.equal(fs.readFileSync("/test.json", "utf8"), "{\"name\":\"Sally\"}");
  assert.equal(fs.readFileSync("/test1.txt", "utf8"), "before_hello <<456>> world_after");
  assert.equal(fs.readFileSync("/test2.txt", "utf8"), "before_hello <<456>> world_after");
  assert.equal(fs.readFileSync("/test3.log", "utf8"), "hello 123 world");
  assert.equal(fs.readFileSync("/test4.txt", "utf8"), "before_hello <<456>> world_after");

  fs.mkdirSync("/dir");
  fs.mkdirSync("/dir/test/");
  fs.writeFileSync("/dir/test/file.txt", "hello");
  assert.deepEqual(Utility.fsMatch("test1.txt", "path"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch("/test1.txt", "path"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch("*1*", "glob"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch("/dir/test/*", "glob"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("/dir/**", "glob"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("/*.txt", "glob"), [
    "/test1.txt",
    "/test2.txt",
    "/test4.txt"
  ]);
  assert.deepEqual(Utility.fsMatch("1", "regex"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch(".*file.*", "regex"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("/dir", "regex"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("^/[^\\/]*\\.txt", "regex"), [
    "/test1.txt",
    "/test2.txt",
    "/test4.txt"
  ]);
  console.log("Completed");
})();
