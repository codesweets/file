import * as jsonpatch from "fast-json-patch";
import {TaskMeta, TaskWithData} from "@codesweets/core";
import {FileEncoding} from "./utility";
import detectIndent from "detect-indent";
import fs from "fs";
import path from "path";

export interface JSONPatchData {
  path: string;

  /** @default "utf8" */
  encoding?: FileEncoding;

  /** @default "[]" */
  patch: string;
}

export class JSONPatch extends TaskWithData<JSONPatchData> {
  public static meta: TaskMeta = new TaskMeta({
    construct: JSONPatch,
    inputs: [],
    schema: require("ts-schema!./json-patch.ts?JSONPatchData"),
    typename: "JSONPatch",
    uiSchema: {
      patch: {
        "ui:options": {
          mode: "javascript"
        },
        "ui:widget": "code"
      }
    }
  })

  protected async onInitialize () {
    const filePath = path.resolve("/", this.data.path);
    const encoding = this.data.encoding || "utf8";
    const inText = fs.readFileSync(filePath, encoding);
    const inDocument = JSON.parse(inText);
    const {indent} = detectIndent(inText);
    const patch = JSON.parse(this.data.patch);
    const outDocument = jsonpatch.applyPatch(inDocument, patch).newDocument;
    const outText = JSON.stringify(outDocument, null, indent);
    fs.writeFileSync(filePath, outText, encoding);
  }
}
