import {TaskMeta, TaskWithData} from "@codesweets/core";
import {Directory} from "./directory";

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
    const path = Directory.resolve(this, this.data.path);
    const buffer = Buffer.from(this.data.content, this.data.encoding);
    await this.fs.promises.writeFile(path, buffer, {
      encoding: "binary"
    });
  }
}
