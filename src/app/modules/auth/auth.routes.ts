import express, { NextFunction, Request, Response } from 'express'
import { AuthControllers } from './auth.controller';

const router = express.Router();

router.post("/login", AuthControllers.login)
export const AuthRoutes = router