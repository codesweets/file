import {TaskFileMatch, TaskMeta, TaskWithData} from "@codesweets/core";
import stringToRegExp from "string-to-regexp";

export interface FileOperation {
  operation: "prepend" | "append" | "replace";
  content?: string;

  /** @default "utf8" */
  content_encoding?: BufferEncoding;

  /**
   * The operation may be applied to one or more portions of text specified by this regular expression.
   * If left empty, the operation will apply to the entire file.
   */
  find_regex?: string;
}

export interface FileOperationsData {

  /** If the path matches a directory the operations apply to all files within the directory, recursively. */
  path: string;

  /** @default "path" */
  path_type: TaskFileMatch;

  /** @default "utf8" */
  file_encoding?: BufferEncoding;

  operations?: FileOperation[];
}

export class FileOperations extends TaskWithData<FileOperationsData> {
  public static meta: TaskMeta = new TaskMeta({
    construct: FileOperations,
    inputs: [],
    schema: require("ts-schema!./file-operations.ts?FileOperationsData"),
    typename: "FileOperations"
  })

  protected async onInitialize () {
    const filePaths = this.fsMatch(this.data.path, this.data.path_type);
    const fileEncoding = this.data.file_encoding || "utf8";
    for (const filePath of filePaths) {
      let string = (await this.fs.promises.readFile(filePath, fileEncoding)) as string;

      for (const op of this.data.operations) {
        const content = Buffer.from(op.content, op.content_encoding || "utf8").toString("binary");
        if (op.find_regex) {
          let replaceWith = content;
          switch (op.operation) {
            case "prepend": {
              replaceWith = `${replaceWith}$&`;
              break;
            }
            case "append": {
              replaceWith = `$&${replaceWith}`;
              break;
            }
          }

          const regex: RegExp = stringToRegExp(op.find_regex);
          string = string.replace(regex, replaceWith);
        } else {
          switch (op.operation) {
            case "prepend": {
              string = content + string;
              break;
            }
            case "append": {
              string += content;
              break;
            }
            case "replace": {
              string = content;
              break;
            }
          }
        }
      }
      await this.fs.promises.writeFile(filePath, string);
    }
  }
}
