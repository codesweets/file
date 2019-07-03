import {Task, TaskMeta, TaskWithData} from "@codesweets/core";
import path from "path";

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

  public static getWorkingDirectory (task: Task) {
    const dir = task.findAbove<Directory>(Directory);
    return dir ? path.resolve("/", dir.data.directory) : "/";
  }

  public static resolve (task: Task, filePath: string) {
    return path.resolve(Directory.getWorkingDirectory(task), filePath);
  }
}
