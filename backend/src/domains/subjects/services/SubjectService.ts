import { BaseService } from "../../../core/base/BaseService";
import type { Subject } from "../entities/Subject";
import type { Topic } from "../entities/Topic";
import type { SubTopic } from "../entities/SubTopic";

export class SubjectService extends BaseService {
  constructor() {
    super("SubjectService");
  }

  buildTopicTree(subject: Subject, topics: Topic[], subTopics: SubTopic[]) {
    return {
      ...subject,
      topics: topics
        .filter((topic) => topic.subjectId === subject.id)
        .map((topic) => ({
          ...topic,
          subTopics: subTopics.filter((subTopic) => subTopic.topicId === topic.id)
        }))
    };
  }
}
