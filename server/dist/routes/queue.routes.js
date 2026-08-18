"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queue_controller_js_1 = require("../controllers/queue.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const rateLimiter_js_1 = require("../middleware/rateLimiter.js");
const queue_validator_js_1 = require("../validators/queue.validator.js");
const router = (0, express_1.Router)();
router.post('/join', rateLimiter_js_1.queueJoinLimiter, auth_middleware_js_1.optionalAuth, (0, validate_middleware_js_1.validate)(queue_validator_js_1.joinQueueSchema), queue_controller_js_1.QueueController.join);
router.get('/', auth_middleware_js_1.optionalAuth, queue_controller_js_1.QueueController.getQueue);
router.get('/:identifier', queue_controller_js_1.QueueController.getQueueStatus);
router.post('/:id/remove', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), (0, validate_middleware_js_1.validate)(queue_validator_js_1.removeQueueSchema), queue_controller_js_1.QueueController.removeFromQueue);
router.post('/:id/restore', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), queue_controller_js_1.QueueController.restoreToQueue);
exports.default = router;
//# sourceMappingURL=queue.routes.js.map