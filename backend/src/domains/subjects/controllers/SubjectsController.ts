import { BaseController } from "../../../core/base/BaseController";

const subjects = [
  {
    id: "constitution",
    name: "Constitution",
    nameNp: "संविधान",
    topics: [
      { id: "fundamental-rights", name: "Fundamental Rights", loksewaWeight: 12 },
      { id: "constitutional-bodies", name: "Constitutional Bodies", loksewaWeight: 10 }
    ]
  },
  {
    id: "geography",
    name: "Geography",
    nameNp: "भूगोल",
    topics: [
      { id: "mountains", name: "Mountains and Rivers", loksewaWeight: 8 },
      { id: "provinces", name: "Federal Provinces", loksewaWeight: 8 }
    ]
  }
];

export class SubjectsController extends BaseController {
  async getAll() {
    return subjects.map(({ topics: _topics, ...subject }) => subject);
  }

  async getById(id: string) {
    const subject = subjects.find((item) => item.id === id);
    if (!subject) throw new Error("Subject not found");
    return subject;
  }

  async getTopics(id: string) {
    const subject = await this.getById(id);
    return subject.topics;
  }

  async getTopicById(id: string) {
    for (const subject of subjects) {
      const topic = subject.topics.find((item) => item.id === id);
      if (topic) return { ...topic, subjectId: subject.id };
    }
    throw new Error("Topic not found");
  }
}
