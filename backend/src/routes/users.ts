import { Request, Response, Router } from "express";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";

const router = Router();

router.post(
  "/register",
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more character required").isLength({
      min: 6,
    }),
  ],

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    try {
      let user = await User.findOne({
        email: req.body.email,
      });

      if (user) {
        return res.status(400).json({ message: "User Already Exists" });
      }

      user = new User(req.body);
      await user.save();

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NoDE_ENV === "production",
        maxAge: 86400000,
      });

      // return res.sendStatus(201);
      return res.status(201).json({ message: "User Created  Successfully" });
    } catch (error) {
      console.log("User Error: " + error);
      res.status(500).send({ message: "Something Went Wrong" });
    }
  }
);

export default router;
