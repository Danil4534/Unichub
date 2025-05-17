import { Subject } from './../subject/entities/subject.entity';
import { TaskGrade } from './../task-grade/entities/task-grade.entity';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { join } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
@Injectable()
export class GradeBookService {
  constructor(private prisma: PrismaService) {}

  async getAllSubjectGradesWithTasks(userId: string) {
    const result = await this.prisma.group.findMany({
      include: {
        students: {
          include: {
            TaskGrade: {
              select: {
                id: true,
                grade: true,
              },
            },
          },
        },
      },
    });

    return result;
  }
  async getGroupRatingData(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        students: {
          include: {
            TaskGrade: {
              include: {
                task: {
                  include: {
                    Subject: true,
                  },
                },
              },
            },
          },
        },
        subjects: true,
      },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    const subjectNames = group.subjects.map((subj) => subj.name);
    const headerRow = [
      'Student ID',
      'Name Surname',
      'Group',
      ...subjectNames,
      'Average',
    ];

    const studentRows = [];

    for (const student of group.students.filter(
      (item) => !item.roles.some((role) => ['Admin', 'Teacher'].includes(role)),
    )) {
      const subjectGradesMap: Record<string, number[]> = {};

      for (const tg of student.TaskGrade) {
        const subject = tg.task?.Subject;
        if (!subject) continue;

        const subjectName = subject.name;
        if (!subjectGradesMap[subjectName]) {
          subjectGradesMap[subjectName] = [];
        }
        subjectGradesMap[subjectName].push(tg.grade);
      }

      const avgGrades = subjectNames.map((subjName) => {
        const grades = subjectGradesMap[subjName] || [];
        return grades.length
          ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2)
          : 'N/A';
      });

      const validGrades = avgGrades.filter((avg) => avg !== 'N/A').map(Number);

      const overallAverage = validGrades.length
        ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(
            2,
          )
        : 'N/A';

      studentRows.push({
        data: [
          student.id,
          `${student.name ?? ''} ${student.surname ?? ''}`,
          group.name,
          ...avgGrades,
          overallAverage,
        ],
        averageNumeric:
          overallAverage === 'N/A' ? -1 : parseFloat(overallAverage),
      });
    }

    studentRows.sort((a, b) => b.averageNumeric - a.averageNumeric);

    const result = {
      headers: headerRow,
      rows: studentRows.map((s) => s.data),
    };

    return result;
  }

  async exportGroupRatingToExcel(groupId: string, res: Response) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        students: {
          include: {
            TaskGrade: {
              include: {
                task: {
                  include: {
                    Subject: true,
                  },
                },
              },
            },
          },
        },
        subjects: true,
      },
    });

    if (!group) {
      res.status(404).send('Group not found');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Group ${group.name}`);
    const subjectNames = group.subjects.map((subj) => subj.name);

    const headerRow = [
      'Student ID',
      'Name Surname',
      'Group',
      ...subjectNames,
      'Average',
    ];
    const header = worksheet.addRow(headerRow);
    const sheet = worksheet.getRow(1);
    sheet.font = { bold: true };

    sheet.eachCell((cell) => {
      cell.border = {
        bottom: { style: 'medium', color: { argb: '000000' } },
      };
    });

    const averageColIndex = headerRow.length;
    header.getCell(averageColIndex).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' },
    };

    header.eachCell((cell) => {
      cell.alignment = {
        vertical: 'bottom',
        horizontal: 'left',
        wrapText: true,
      };
    });

    const studentRows = [];

    for (const student of group.students.filter(
      (item) => !item.roles.some((role) => ['Admin', 'Teacher'].includes(role)),
    )) {
      const subjectGradesMap: Record<string, number[]> = {};

      for (const tg of student.TaskGrade) {
        const subject = tg.task?.Subject;
        if (!subject) continue;

        const subjectName = subject.name;
        if (!subjectGradesMap[subjectName]) {
          subjectGradesMap[subjectName] = [];
        }
        subjectGradesMap[subjectName].push(tg.grade);
      }

      const avgGrades = subjectNames.map((subjName) => {
        const grades = subjectGradesMap[subjName] || [];
        return grades.length
          ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(3)
          : 'N/A';
      });

      const validGrades = avgGrades.filter((avg) => avg !== 'N/A').map(Number);

      const overallAverage = validGrades.length
        ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(
            2,
          )
        : 'N/A';

      studentRows.push({
        rowData: [
          student.id,
          ` ${student.name ?? ''}  ${student.surname ?? ''}`,
          group.name,
          ...avgGrades,
          overallAverage,
        ],
        overallAverage:
          overallAverage === 'N/A' ? -1 : parseFloat(overallAverage),
      });
    }

    studentRows.sort((a, b) => b.overallAverage - a.overallAverage);

    for (const student of studentRows) {
      const row = worksheet.addRow(student.rowData);

      row.eachCell((cell, colNumber) => {
        if (colNumber === headerRow.length) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF00' },
          };
          cell.font = {
            color: { argb: '000000' },
            bold: true,
          };
        } else if (cell.value !== 'N/A') {
          const avgValue = parseFloat(cell.value as string);
          if (avgValue < 60 && colNumber !== 1) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF0000' },
            };
            cell.font = {
              color: { argb: 'FFFFFF' },
            };
          } else if (avgValue > 60 && colNumber !== 1) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'ACE1AF' },
            };
            cell.font = {
              color: { argb: '1B4D3E' },
            };
          }
        }
      });
    }

    worksheet.columns?.forEach((col) => {
      col.width = 20;
    });

    const filePath = join(
      __dirname,
      '..',
      '..',
      'tmp',
      `group-${group.name}-ratings.xlsx`,
    );
    await workbook.xlsx.writeFile(filePath);
    res.download(filePath, `group-${group.name}-ratings.xlsx`, () => {
      fs.unlinkSync(filePath);
    });
  }

  async exportGroupedRatingsToExcel(res: Response) {
    const groups = await this.prisma.group.findMany({
      include: {
        students: {
          include: {
            TaskGrade: {
              include: {
                task: {
                  include: {
                    Subject: true,
                  },
                },
              },
            },
          },
        },
        subjects: true,
      },
    });

    const workbook = new ExcelJS.Workbook();

    for (const group of groups) {
      const worksheet = workbook.addWorksheet(`Group ${group.name}`);
      const subjectNames = group.subjects.map((subj) => subj.name);

      const headerRow = [
        'Student ID',
        'Name Surname',
        'Group',
        ...subjectNames,
        'Average',
      ];
      const header = worksheet.addRow(headerRow);
      const sheet = worksheet.getRow(1);
      sheet.font = { bold: true };

      sheet.eachCell((cell) => {
        cell.border = {
          bottom: { style: 'medium', color: { argb: '000000' } },
        };
      });

      const averageColIndex = headerRow.length;
      header.getCell(averageColIndex).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' },
      };

      header.eachCell((cell) => {
        cell.alignment = {
          vertical: 'bottom',
          horizontal: 'left',
          wrapText: true,
        };
      });

      const studentRows = [];

      for (const student of group.students) {
        const subjectGradesMap: Record<string, number[]> = {};

        for (const tg of student.TaskGrade) {
          const subject = tg.task?.Subject;
          if (!subject) continue;

          const subjectName = subject.name;
          if (!subjectGradesMap[subjectName]) {
            subjectGradesMap[subjectName] = [];
          }
          subjectGradesMap[subjectName].push(tg.grade);
        }

        const avgGrades = subjectNames.map((subjName) => {
          const grades = subjectGradesMap[subjName] || [];
          return grades.length
            ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2)
            : 'N/A';
        });

        const validGrades = avgGrades
          .filter((avg) => avg !== 'N/A')
          .map(Number);

        const overallAverage = validGrades.length
          ? (
              validGrades.reduce((a, b) => a + b, 0) / validGrades.length
            ).toFixed(2)
          : 'N/A';

        studentRows.push({
          rowData: [
            student.id,
            ` ${student.name ?? ''}  ${student.surname ?? ''}`,
            group.name,
            ...avgGrades,
            overallAverage,
          ],
          overallAverage:
            overallAverage === 'N/A' ? -1 : parseFloat(overallAverage),
        });
      }
      studentRows.sort((a, b) => b.overallAverage - a.overallAverage);
      for (const student of studentRows) {
        const row = worksheet.addRow(student.rowData);

        row.eachCell((cell, colNumber) => {
          if (colNumber === headerRow.length) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF00' },
            };
            cell.font = {
              color: { argb: '000000' },
              bold: true,
            };
          } else if (cell.value !== 'N/A') {
            const avgValue = parseFloat(cell.value as string);
            if (avgValue < 60 && colNumber !== 1) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0000' },
              };
              cell.font = {
                color: { argb: 'FFFFFF' },
              };
            } else if (avgValue > 60 && colNumber !== 1) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'ACE1AF' },
              };
              cell.font = {
                color: { argb: '1B4D3E' },
              };
            }
          }
        });
      }

      worksheet.columns?.forEach((col) => {
        col.width = 20;
      });
    }

    const filePath = join(__dirname, '..', '..', 'tmp', 'grouped-ratings.xlsx');
    await workbook.xlsx.writeFile(filePath);
    res.download(filePath, 'grouped-ratings.xlsx', () => {
      fs.unlinkSync(filePath);
    });
  }

  async exportGroupRatingToPdf(groupId: string, res: Response) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        students: {
          include: {
            TaskGrade: {
              include: {
                task: {
                  include: {
                    Subject: true,
                  },
                },
              },
            },
          },
        },
        subjects: true,
      },
    });

    if (!group) {
      res.status(404).send('Group not found');
      return;
    }

    const subjectNames = group.subjects.map((s) => s.name);
    const doc = new PDFDocument({
      margin: 30,
      size: 'A4',
      layout: 'landscape',
    });
    const filePath = join(
      __dirname,
      '..',
      '..',
      'tmp',
      `group-${group.name}-ratings.pdf`,
    );
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc
      .fontSize(14)
      .text(`Group Rating Report: ${group.name}`, { align: 'left' });
    doc.moveDown(1);

    const tableTop = doc.y;
    const rowHeight = 24;
    const cellPadding = 5;

    const columnWidths = [
      120, // ID
      130, // Name Surname
      100, // Group
      ...subjectNames.map(() => 60), // Subject grades
      70, // Average
    ];

    const headers = [
      'Student ID',
      'Name Surname',
      'Group',
      ...subjectNames,
      'Average',
    ];

    // Prepare student rows
    const studentRows: string[][] = [];

    for (const student of group.students.filter(
      (item) => !item.roles.some((role) => ['Admin', 'Teacher'].includes(role)),
    )) {
      const subjectGradesMap: Record<string, number[]> = {};

      for (const tg of student.TaskGrade) {
        const subject = tg.task?.Subject;
        if (!subject) continue;
        const name = subject.name;
        if (!subjectGradesMap[name]) subjectGradesMap[name] = [];
        subjectGradesMap[name].push(tg.grade);
      }

      const avgGrades = subjectNames.map((subj) => {
        const grades = subjectGradesMap[subj] || [];
        return grades.length
          ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2)
          : 'N/A';
      });

      const validGrades = avgGrades.filter((x) => x !== 'N/A').map(Number);
      const overallAvg = validGrades.length
        ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(
            3,
          )
        : 'N/A';

      studentRows.push([
        student.id,
        `${student.name ?? ''} ${student.surname ?? ''}`,
        group.name,
        ...avgGrades,
        overallAvg,
      ]);
    }

    // Sort descending by average
    studentRows.sort((a, b) => {
      const aAvg = a[a.length - 1];
      const bAvg = b[b.length - 1];
      const aNum = aAvg === 'N/A' ? -1 : parseFloat(aAvg);
      const bNum = bAvg === 'N/A' ? -1 : parseFloat(bAvg);
      return bNum - aNum;
    });

    const drawRow = (row: string[], y: number, isHeader = false) => {
      let x = doc.page.margins.left;

      for (let i = 0; i < row.length; i++) {
        const width = columnWidths[i];
        const text = row[i];
        let fillColor = 'black';
        let bgColor = isHeader ? '#dddddd' : '#ffffff';

        if (!isHeader) {
          // Grade coloring
          if (i >= 3 && i < 3 + subjectNames.length && text !== 'N/A') {
            const grade = parseFloat(text);
            fillColor = grade < 60 ? 'red' : 'green';
            bgColor = grade < 60 ? '#FFA1A1' : 'lightgreen';
          }

          if (i === row.length - 1) {
            bgColor = '#ffffcc';
            const val = text !== 'N/A' ? parseFloat(text) : 100;
            fillColor = val < 60 ? 'red' : 'black';
          }
        }

        doc.rect(x, y, width, rowHeight).fill(bgColor).stroke();

        doc
          .fillColor(fillColor)
          .fontSize(10)
          .text(text, x + cellPadding, y + cellPadding, {
            width: width - cellPadding * 2,
            align: 'center',
          });

        x += width;
      }
    };

    // Drawing all rows
    let y = tableTop;
    drawRow(headers, y, true);
    y += rowHeight;

    for (const row of studentRows) {
      if (y + rowHeight > doc.page.height - 40) {
        doc.addPage({ size: 'A4', layout: 'landscape' });
        y = doc.y;
        drawRow(headers, y, true);
        y += rowHeight;
      }
      drawRow(row, y);
      y += rowHeight;
    }

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, `group-${group.name}-ratings.pdf`, () => {
        fs.unlinkSync(filePath);
      });
    });
  }
}
