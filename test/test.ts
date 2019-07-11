import {FileCreate, FileOperations} from "@codesweets/file";
import {TaskRoot} from "@codesweets/core";
import assert from "assert";

(async () => {
  const root = new TaskRoot();
  await root.fs.promises.writeFile("/test1.txt", "hello 123 world");
  await root.fs.promises.writeFile("/test2.txt", "hello 123 world");
  await root.fs.promises.writeFile("/test3.log", "hello 123 world");

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

  await root.run();
  assert.equal(await root.fs.promises.readFile("/test1.txt", "utf8"), "before_hello <<456>> world_after");
  assert.equal(await root.fs.promises.readFile("/test2.txt", "utf8"), "before_hello <<456>> world_after");
  assert.equal(await root.fs.promises.readFile("/test3.log", "utf8"), "hello 123 world");
  assert.equal(await root.fs.promises.readFile("/test4.txt", "utf8"), "before_hello <<456>> world_after");
})();
