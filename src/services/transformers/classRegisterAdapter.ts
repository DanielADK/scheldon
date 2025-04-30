import { ClassRegister } from '@models/ClassRegister';
import { ClassRegisterEntry } from '@services/transformers/classRegisterExport';
import { formatDate } from '@lib/timeLib';
import { AbstractAdapter } from '@services/transformers/AbstractAdapter';

export class ClassRegisterAdapter extends AbstractAdapter<ClassRegister, ClassRegisterEntry> {
  /**
   * Transforms a ClassRegister object into a ClassRegisterEntry object with a detailed structured format.
   *
   * @param {ClassRegister} lesson - The class register object containing raw lesson data.
   * @return {Promise<ClassRegisterEntry>} A promise that resolves to a formatted ClassRegisterEntry object.
   */
  async transform(lesson: ClassRegister): Promise<ClassRegisterEntry> {
    const entry = await lesson.getEntry();
    return {
      lessonId: lesson.lessonId,
      topic: lesson.topic,
      date: formatDate(new Date(lesson.date)),
      fillDate: lesson.fillDate ? formatDate(new Date(lesson.fillDate)) : null,
      note: lesson.note,

      teacher: {
        name: entry.teacher.name,
        surname: entry.teacher.surname,
        ...(entry.teacher.abbreviation !== null && {
          abbreviation: entry.teacher.abbreviation
        })
      },
      subject: {
        name: entry.subject.name,
        abbreviation: entry.subject.abbreviation
      },
      class: { name: entry.class.name },
      ...(entry.studentGroup !== null && {
        studentGroup: entry.studentGroup.name
      }),
      room: { name: entry.room.name }
    } as ClassRegisterEntry;
  }
}
