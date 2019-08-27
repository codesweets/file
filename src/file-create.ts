import {TaskMeta, TaskWithData} from "@codesweets/core";
import {FileEncoding} from "./utility";
import fs from "fs";
import mkdirp from "mkdirp";
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
    typename: "FileCreate",
    uiSchema: {
      content: {
        "ui:widget": "code"
      }
    }
  })

  protected async onInitialize () {
    const filePath = path.resolve("/", this.data.path);
    const buffer = Buffer.from(this.data.content || "", this.data.encoding || "utf8");
    mkdirp.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, buffer, {
      encoding: "binary"
    });
  }
}
