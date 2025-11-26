import { Router } from "express";
import { getMonthlyStats } from "../controllers/stats.controller.js";
import { authorizeRoles, isLoggedIn } from "../middleware/auth.middleware.js";
import { subscribedUsersCount } from "../controllers/stats.controller.js";


const router = Router();

router.get('/',isLoggedIn, authorizeRoles('ADMIN'),getMonthlyStats)
router.get('/subscribedUsersCount', isLoggedIn, authorizeRoles('ADMIN'), subscribedUsersCount)


export default router