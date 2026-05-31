export interface TopicTreeDTO {
  subjectId: string;
  topics: Array<{ id: string; title: string; subTopics: Array<{ id: string; title: string }> }>;
}
