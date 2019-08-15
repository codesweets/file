import {TaskMeta, TaskWithData} from "@codesweets/core";
import fs from "fs";
import path from "path";

export type FileCreateEncoding = "utf8" | "ascii" | "base64" | "hex";

export interface FileCreateData {
  path: string;
  content: string;

  /** @default "utf8" */
  encoding?: FileCreateEncoding;
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
    const buffer = Buffer.from(this.data.content, this.data.encoding);
    fs.writeFileSync(filePath, buffer, {
      encoding: "binary"
    });
  }
}
