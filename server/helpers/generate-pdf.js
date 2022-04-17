import PDFDocument from "pdfkit";
import getStream from "get-stream";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bwipjs from "bwip-js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export default class PdfKitService {
  /**
   * Generate a PDF of the letter
   *
   * @returns {Buffer}
   */
  async generatePdf(fields) {
    // const fields = [
    //     { id: 'price', name: 'Price', checked: true, value: '$24' },

    //     {
    //         id: 'displayName',
    //         name: 'Display Name',
    //         checked: true,
    //         value: 'Anchor Bracelet Leather - Small / Black / Rubber'
    //     },
    //     { id: 'barcode', name: 'Barcode', checked: true, value: '50101155' },

    // ]
    try {
      const doc = new PDFDocument({
        size: [80, 190],
        margins: { top: 0, left: 0, bottom: 0, right: 0 },
        margin: 0,
      });
      let x = 10,
        y = 0;
      doc.rotate(-90, { origin: [85, 95] });
      console.log(fields);
      fields.map(async (field) => {
        switch (field.id) {
          case "barcode":
            x = x + 15;
            doc
              .font(__dirname + "/font/barcode.ttf")
              .fontSize(30)
              .text(
                "*" + field.value + "*",
                {
                  align: "center",
                  width: doc.page.height,
                },
                x,
                y
              );
            x = x + 25;
            doc
              .font(__dirname + "/font/arial.ttf")
              .fontSize(6)
              .text(
                field.value,
                {
                  align: "center",
                  width: doc.page.height,
                },
                x,
                y
              );
            break;
          case "displayName":
            x = x + 20;
            doc
              .font(__dirname + "/font/arial.ttf")
              .fontSize(7)
              .text(
                field.value,
                {
                  align: "center",
                  width: doc.page.height,
                },
                x,
                y
              );

            break;
          case "price":
            x = x + 5;
            doc
              .font(__dirname + "/font/arial.ttf")
              .fontSize(17)
              .text(
                "$" + field.value,
                {
                  align: "center",
                  width: doc.page.height,
                },
                x,
                y
              );

            break;
        }
      });
      console.log(doc.page.width, doc.page.height);
      doc.save();
      doc.end();
      const pdfStream = await getStream.buffer(doc);
      return pdfStream;
    } catch (error) {
      return null;
    }
  }
  _generateBarcode(text) {
    return new Promise((resolve, reject) => {
      bwipjs.toString(
        {
          bcid: "code128",
          text,
          scale: 5,
          height: 10,
          includetext: true,
          textxalign: "center",
        },
        (err, png) => {
          if (err) reject(err);
          else resolve(png);
        }
      );
    });
  }
}
