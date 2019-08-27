import {FileCreate, FileOperations, FileUpload, JSONPatch, Utility} from "../src/main";
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
  new FileUpload(root, {
    directory: "/uploads",
    files: [
      "data:text/plain;name=upload_a.log;base64,dGVzdAo=",
      "data:text/plain;name=upload_b.log;base64,dGVzdAo="
    ]
  });
  new FileUpload(root, {
    directory: "/uploads/extract/",
    extract: true,
    files: [
      // eslint-disable-next-line max-len
      "data:application/zip;name=test.zip;base64,UEsDBBQAAAAAAO4EGk8AAAAAAAAAAAAAAAAFACAAdGVzdC9VVA0AB7GMY122jGNdsYxjXXV4CwABBOgDAAAE6AMAAFBLAwQUAAgACACTBBpPAAAAAAAAAAAFAAAACgAgAHRlc3QvYi50eHRVVA0ABwaMY12pjGNdsYxjXXV4CwABBOgDAAAE6AMAACtJLS7hAgBQSwcIxjW5OwcAAAAFAAAAUEsDBBQACAAIAJMEGk8AAAAAAAAAAAUAAAAKACAAdGVzdC9hLnR4dFVUDQAHBoxjXamMY12vjGNddXgLAAEE6AMAAAToAwAAK0ktLuECAFBLBwjGNbk7BwAAAAUAAABQSwECFAMUAAAAAADuBBpPAAAAAAAAAAAAAAAABQAgAAAAAAAAAAAA7UEAAAAAdGVzdC9VVA0AB7GMY122jGNdsYxjXXV4CwABBOgDAAAE6AMAAFBLAQIUAxQACAAIAJMEGk/GNbk7BwAAAAUAAAAKACAAAAAAAAAAAACkgUMAAAB0ZXN0L2IudHh0VVQNAAcGjGNdqYxjXbGMY111eAsAAQToAwAABOgDAABQSwECFAMUAAgACACTBBpPxjW5OwcAAAAFAAAACgAgAAAAAAAAAAAApIGiAAAAdGVzdC9hLnR4dFVUDQAHBoxjXamMY12vjGNddXgLAAEE6AMAAAToAwAAUEsFBgAAAAADAAMAAwEAAAEBAAAAAA=="
    ]
  });

  await root.run();
  assert.equal(fs.readFileSync("/uploads/upload_a.log", "utf8"), "test\n");
  assert.equal(fs.readFileSync("/uploads/upload_b.log", "utf8"), "test\n");
  assert.equal(fs.readFileSync("/uploads/extract/test/a.txt", "utf8"), "test\n");
  assert.equal(fs.readFileSync("/uploads/extract/test/b.txt", "utf8"), "test\n");
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
