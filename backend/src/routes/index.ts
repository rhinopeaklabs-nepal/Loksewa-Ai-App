import type { FastifyInstance } from "fastify";
import type { AnalyticsController } from "../domains/analytics/controllers/AnalyticsController";
import type { AnswerController } from "../domains/answers/controllers/AnswerController";
import type { AuthController } from "../domains/auth/controllers/AuthController";
import type { LearningController } from "../domains/learning/controllers/LearningController";
import type { MockTestController } from "../domains/mock-test/controllers/MockTestController";
import type { QuestionController } from "../domains/questions/controllers/QuestionController";
import type { ScanController } from "../domains/scan/controllers/ScanController";
import type { SubjectsController } from "../domains/subjects/controllers/SubjectsController";
import type { SubscriptionController } from "../domains/subscription/controllers/SubscriptionController";
import type { TutorController } from "../domains/ai-tutor/controllers/TutorController";
import type { UserController } from "../domains/user/controllers/UserController";
import { analyticsRoutes } from "./analytics.routes";
import { answersRoutes } from "./answers.routes";
import { authRoutes } from "./auth.routes";
import { learningRoutes } from "./learning.routes";
import { mockTestRoutes } from "./mocktest.routes";
import { questionsRoutes } from "./questions.routes";
import { scanRoutes } from "./scan.routes";
import { subjectsRoutes } from "./subjects.routes";
import { subscriptionRoutes } from "./subscription.routes";
import { tutorRoutes } from "./tutor.routes";
import { userRoutes } from "./user.routes";

export interface RouteControllers {
  analyticsController: AnalyticsController;
  answerController: AnswerController;
  authController: AuthController;
  learningController: LearningController;
  mockTestController: MockTestController;
  questionController: QuestionController;
  scanController: ScanController;
  subjectsController: SubjectsController;
  subscriptionController: SubscriptionController;
  tutorController: TutorController;
  userController: UserController;
}

export async function registerRoutes(fastify: FastifyInstance, controllers: RouteControllers): Promise<void> {
  await fastify.register(authRoutes, { authController: controllers.authController });
  await fastify.register(userRoutes, { userController: controllers.userController });
  await fastify.register(subjectsRoutes, { subjectsController: controllers.subjectsController });
  await fastify.register(questionsRoutes, { questionController: controllers.questionController });
  await fastify.register(answersRoutes, { answerController: controllers.answerController });
  await fastify.register(scanRoutes, { scanController: controllers.scanController });
  await fastify.register(learningRoutes, { learningController: controllers.learningController });
  await fastify.register(tutorRoutes, { tutorController: controllers.tutorController });
  await fastify.register(mockTestRoutes, { mockTestController: controllers.mockTestController });
  await fastify.register(analyticsRoutes, { analyticsController: controllers.analyticsController });
  await fastify.register(subscriptionRoutes, { subscriptionController: controllers.subscriptionController });
}
