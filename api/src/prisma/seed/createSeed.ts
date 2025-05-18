import { PrismaClient, Role, UserSex, TypeTask } from '@prisma/client';

const prisma = new PrismaClient();

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function clearDatabase() {
  console.log('🧹 Clearing database...');
  await prisma.taskGrade.deleteMany();
  await prisma.gradeBook.deleteMany();
  await prisma.task.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  await prisma.group.deleteMany();
}

async function seedGroups() {
  console.log('📦 Seeding groups...');
  const groups = [
    { name: 'Group A', status: 'New' },
    { name: 'Group B', status: 'New' },
  ];
  await prisma.group.createMany({ data: groups });
  return prisma.group.findMany();
}
async function seedEvents(groups: any[]) {
  console.log('📅 Seeding daily events...');

  const eventTitles = [
    'Orientation',
    'Workshop',
    'Group Meeting',
    'Exam Prep',
    'Project Deadline',
  ];

  const daysToGenerate = 30;

  const events = groups.flatMap((group) => {
    return Array.from({ length: daysToGenerate }).map((_, i) => {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + i); // next i-th day

      const randomHour = getRandomInt(8, 17); // 8 AM to 5 PM
      const randomMinute = getRandomInt(0, 59);

      const start = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        randomHour,
        randomMinute,
      );

      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

      return prisma.event.create({
        data: {
          title: eventTitles[getRandomInt(0, eventTitles.length - 1)],
          description: `Auto-generated event for ${start.toDateString()}`,
          start,
          end,
          status: 'Scheduled',
          created: new Date(),
          groupId: group.id,
        },
      });
    });
  });

  return Promise.all(events);
}
async function seedUsers(count: number) {
  console.log(`👤 Seeding ${count} users...`);
  const users = Array.from({ length: count }).map((_, i) => ({
    name: `User${i + 1}`,
    surname: `Surname${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `+123456789${i}`,
    password: 'hashed-password',
    roles: [Role.Student],
    sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
  }));

  return Promise.all(users.map((user) => prisma.user.create({ data: user })));
}

async function assignUsersToGroups(users: any[], groups: any[]) {
  console.log('🔗 Assigning users to groups...');
  return Promise.all(
    users.map((user) => {
      const group = groups[getRandomInt(0, groups.length - 1)];
      return prisma.user.update({
        where: { id: user.id },
        data: { groupId: group.id },
      });
    }),
  );
}

async function seedSubjects(groups: any[]) {
  console.log('📘 Seeding subjects...');
  const names = [
    'Math',
    'Science',
    'History',
    'Biology',
    'Physics',
    'Chemistry',
    'Literature',
    'Geography',
    'Art',
    'PE',
  ];

  return Promise.all(
    names.map((name) => {
      const group = groups[getRandomInt(0, groups.length - 1)];
      return prisma.subject.create({
        data: {
          name,
          description: `Auto-generated subject for ${name}`,
          status: 'Active',
          groups: {
            connect: [{ id: group.id }],
          },
        },
      });
    }),
  );
}

async function seedTasks(subjects: any[]) {
  console.log('📝 Seeding tasks...');
  return Promise.all(
    subjects.flatMap((subject) => [
      prisma.task.create({
        data: {
          title: `Test for ${subject.name}`,
          description: 'Test description',
          type: TypeTask.Test,
          grade: 100,
          subjectId: subject.id,
        },
      }),
      prisma.task.create({
        data: {
          title: `Default for ${subject.name}`,
          description: 'Default description',
          type: TypeTask.Default,
          grade: 100,
          subjectId: subject.id,
        },
      }),
    ]),
  );
}
async function seedLessons(subjects: any[]) {
  console.log('📚 Seeding lessons...');

  const lessonTitles = [
    'Introduction',
    'Chapter 1',
    'Chapter 2',
    'Review Session',
    'Practical Lab',
    'Discussion Hour',
  ];

  const lessons = subjects.flatMap((subject) =>
    Array.from({ length: getRandomInt(3, 6) }).map((_, i) => {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + i);

      const startTime = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        getRandomInt(8, 15),
        getRandomInt(0, 59),
      );

      const endTime = new Date(startTime.getTime() + 45 * 60000);

      return prisma.lesson.create({
        data: {
          title: lessonTitles[i % lessonTitles.length],
          description: `Auto-generated lesson for ${subject.name}`,
          startTime,
          endTime,
          linkForMeeting: `https://meet.example.com/${subject.id.slice(0, 8)}-${i}`,
          created: new Date(),
          subjectId: subject.id,
        },
      });
    }),
  );

  return Promise.all(lessons);
}

async function seedTaskGrades(users: any[], tasks: any[]) {
  console.log('📊 Seeding task grades...');
  return Promise.all(
    users.flatMap((user) =>
      tasks.map((task) =>
        prisma.taskGrade.create({
          data: {
            userId: user.id,
            taskId: task.id,
            grade: getRandomInt(50, 100),
          },
        }),
      ),
    ),
  );
}

async function seedGradeBooks(users: any[], subjects: any[]) {
  console.log('📕 Seeding grade books...');
  for (const user of users) {
    for (const subject of subjects) {
      const grades = await prisma.taskGrade.findMany({
        where: {
          userId: user.id,
          task: { subjectId: subject.id },
        },
      });

      if (grades.length > 0) {
        const avgGrade = Math.round(
          grades.reduce((sum, g) => sum + g.grade, 0) / grades.length,
        );

        await prisma.gradeBook.create({
          data: {
            userId: user.id,
            subjectId: subject.id,
            grade: avgGrade,
          },
        });
      }
    }
  }
}

async function main() {
  try {
    console.log('🌱 Starting seeding process...');
    await clearDatabase();

    const groups = await seedGroups();
    const users = await seedUsers(40);
    await assignUsersToGroups(users, groups);
    await seedEvents(groups);
    const subjects = await seedSubjects(groups);
    const tasks = await seedTasks(subjects);

    await seedTaskGrades(users, tasks);
    await seedGradeBooks(users, subjects);
    await seedLessons(subjects);

    console.log('✅ Database successfully seeded!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
