/**
 * Tạo file Word (.docx) cho mẫu đơn hỗ trợ.
 * Chạy: node scripts/generate-support-forms.cjs
 */
const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} = require("docx");

const OUT_DIR = path.join(__dirname, "../client/public/forms");

function dottedLine(label, dots = 52) {
  return new Paragraph({
    spacing: { after: 180, line: 360 },
    children: [
      new TextRun({ text: label, size: 24, font: "Times New Roman" }),
      new TextRun({
        text: " " + ".".repeat(dots),
        size: 24,
        font: "Times New Roman"
      })
    ]
  });
}

function blankLines(count = 4) {
  return Array.from({ length: count }, () =>
    new Paragraph({
      spacing: { after: 180, line: 360 },
      children: [
        new TextRun({
          text: ".".repeat(70),
          size: 24,
          font: "Times New Roman"
        })
      ]
    })
  );
}

function headerBlock() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
          bold: true,
          size: 24,
          font: "Times New Roman"
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: "Độc lập - Tự do - Hạnh phúc",
          bold: true,
          size: 24,
          font: "Times New Roman",
          underline: {}
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: "Hà Nội, ngày .... tháng .... năm 202....",
          italics: true,
          size: 24,
          font: "Times New Roman"
        })
      ]
    })
  ];
}

function titleBlock(title) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 320 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 28,
        font: "Times New Roman"
      })
    ]
  });
}

function recipientBlock() {
  return new Paragraph({
    spacing: { after: 240 },
    children: [
      new TextRun({ text: "Kính gửi: ", bold: true, size: 24, font: "Times New Roman" }),
      new TextRun({
        text: "Bộ phận vận hành Trung tâm TOEIC TZONE.",
        size: 24,
        font: "Times New Roman"
      })
    ]
  });
}

function signatureTable(leftTitle, rightTitle) {
  const noBorder = {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE }
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 480 },
                children: [
                  new TextRun({
                    text: leftTitle,
                    bold: true,
                    size: 22,
                    font: "Times New Roman"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120 },
                children: [
                  new TextRun({
                    text: "(Ký và ghi rõ họ tên)",
                    italics: true,
                    size: 22,
                    font: "Times New Roman"
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 480 },
                children: [
                  new TextRun({
                    text: rightTitle,
                    bold: true,
                    size: 22,
                    font: "Times New Roman"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120 },
                children: [
                  new TextRun({
                    text: "(Ký và ghi rõ họ tên)",
                    italics: true,
                    size: 22,
                    font: "Times New Roman"
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function buildDonTrinhBay() {
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }
          }
        },
        children: [
          ...headerBlock(),
          titleBlock("ĐƠN TRÌNH BÀY"),
          recipientBlock(),
          dottedLine("Tên em là:"),
          dottedLine("Khoá học:"),
          dottedLine("Số điện thoại liên hệ:"),
          dottedLine("Email liên hệ:"),
          new Paragraph({
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({ text: "Nguyện vọng: ", bold: true, size: 24, font: "Times New Roman" }),
              new TextRun({
                text: "(Ghi rõ nội dung cần hỗ trợ; giảng viên của khoá học; thời gian học/ thi)",
                italics: true,
                size: 22,
                font: "Times New Roman"
              })
            ]
          }),
          ...blankLines(5),
          new Paragraph({
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({ text: "Lý do: ", bold: true, size: 24, font: "Times New Roman" })
            ]
          }),
          ...blankLines(4),
          signatureTable("Ý KIẾN CỦA GIẢNG VIÊN", "NGƯỜI VIẾT ĐƠN")
        ]
      }
    ]
  });
}

function buildDonBaoLuu() {
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }
          }
        },
        children: [
          ...headerBlock(),
          titleBlock("ĐƠN XIN NGHỈ HỌC TẠM THỜI VÀ BẢO LƯU KẾT QUẢ HỌC TẬP"),
          recipientBlock(),
          dottedLine("Tên em là:"),
          dottedLine("Khoá học:"),
          dottedLine("Số điện thoại liên hệ:"),
          dottedLine("Email liên hệ:"),
          new Paragraph({
            spacing: { before: 160, after: 160 },
            children: [
              new TextRun({
                text: "Em làm đơn này xin được nghỉ học tạm thời và bảo lưu kết quả học tập.",
                size: 24,
                font: "Times New Roman"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "Thời gian bảo lưu dự kiến (tối đa 3 tháng tính từ ngày bảo lưu):",
                bold: true,
                size: 24,
                font: "Times New Roman"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "Tính từ ngày .... tháng .... năm 202.... đến hết ngày .... tháng .... năm 202.....",
                size: 24,
                font: "Times New Roman"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Lý do nghỉ học: ", bold: true, size: 24, font: "Times New Roman" })
            ]
          }),
          ...blankLines(2),
          new Paragraph({
            spacing: { before: 200, after: 320 },
            children: [
              new TextRun({
                text: "Em cam kết thực hiện đúng các quy định khác liên quan của Trung tâm. Em xin trân trọng cảm ơn!",
                size: 24,
                font: "Times New Roman"
              })
            ]
          }),
          signatureTable("XÁC NHẬN CỦA GIẢNG VIÊN", "NGƯỜI VIẾT ĐƠN")
        ]
      }
    ]
  });
}

async function writeDoc(doc, filename) {
  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`✓ ${outPath}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await writeDoc(buildDonTrinhBay(), "don-trinh-bay.docx");
  await writeDoc(buildDonBaoLuu(), "don-xin-nghi-hoc-bao-luu.docx");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
