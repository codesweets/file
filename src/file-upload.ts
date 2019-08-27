import {TaskMeta, TaskWithData} from "@codesweets/core";
import decompress from "decompress";
import fs from "fs";
import mkdirp from "mkdirp";
import parseDataURL from "data-urls";
import path from "path";

export interface FileUploadData {
  directory: string;

  files: string[];

  /** Extracts an uploaded archive (tar, gz, zip, etc). */
  extract?: boolean;
}

export class FileUpload extends TaskWithData<FileUploadData> {
  public static meta: TaskMeta = new TaskMeta({
    construct: FileUpload,
    inputs: [],
    schema: require("ts-schema!./file-upload.ts?FileUploadData"),
    schemaTransform: (schema: any) => {
      schema.properties.files.items.format = "data-url";
    },
    typename: "FileUpload"
  })

  protected async onInitialize () {
    const directory = path.resolve("/", this.data.directory);
    mkdirp.sync(directory);

    for (const dataUrl of this.data.files) {
      const uploadNameResults = (/;name=(?<name>[^;]+);/u).exec(dataUrl);
      if (!uploadNameResults) {
        throw new Error(`Uploaded data-url did not have a 'name=' parameter for the file-name: ${dataUrl}`);
      }
      const filePath = path.join(directory, uploadNameResults.groups.name);
      const contents = parseDataURL(dataUrl);
      if (this.data.extract) {
        const result = await decompress(contents.body, directory);
        if (result.length === 0) {
          throw new Error(`No files extracted from '${filePath}'. We support .bz2, .tar.bz, .tar.gz, and .zip.`);
        }
      } else {
        fs.writeFileSync(filePath, contents.body, "binary");
      }
    }
  }
}
