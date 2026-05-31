import { BaseController } from "../../../core/base/BaseController";

export class SubjectController extends BaseController {
  routes() {
    return {
      subjects: "GET /api/subjects",
      topics: "GET /api/subjects/:id/topics",
      topic: "GET /api/topics/:id"
    };
  }
}
