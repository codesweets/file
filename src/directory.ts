import {TaskMeta, TaskWithData} from "@codesweets/core";

export interface DirectoryData {

  /** @default "/" */
  directory: string;
}

export class Directory<T extends DirectoryData = DirectoryData> extends TaskWithData<T> {
  public static meta: TaskMeta = new TaskMeta({
    construct: Directory,
    inputs: [],
    schema: require("ts-schema!./directory.ts?DirectoryData"),
    typename: "Directory"
  })
}
