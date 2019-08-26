import {TaskMeta, TaskWithData} from "@codesweets/core";
import {FileEncoding} from "./utility";
import fs from "fs";
import path from "path";


export interface FileCreateData {
  path: string;

  /** @default "utf8" */
  encoding?: FileEncoding;

  content?: string;
}

export class FileCreate extends TaskWithData<FileCreateData> {
  public static meta: TaskMeta = new TaskMeta({
    construct: FileCreate,
    inputs: [],
    schema: require("ts-schema!./file-create.ts?FileCreateData"),
    typename: "FileCreate"
  })

  protected async onInitialize () {
    const filePath = path.resolve("/", this.data.path);
    const buffer = Buffer.from(this.data.content || "", this.data.encoding || "utf8");
    try {
      fs.mkdirSync(path.dirname(filePath), {
        recursive: true
      });
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }
    fs.writeFileSync(filePath, buffer, {
      encoding: "binary"
    });
  }
}
