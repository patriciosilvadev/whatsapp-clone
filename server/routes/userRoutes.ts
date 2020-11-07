import { Request, Response, Router } from "express";
import { check } from "express-validator";
import { BadRequestError } from "../Errors/BadRequestError";
import { validateRequest } from "../middlewares/validateRequest";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { auth, JWT } from "../middlewares/auth";
import { NotAuthorizedError } from "../Errors/NotAuthorizedError";
import { socket } from "../socket";

const route = Router();

declare module "express-session" {
  interface Session {
    user?: JWT;
  }
}

route.get(
  "/currentUser",
  async (req: Request, res: Response): Promise<void> => {
    if (!req.session?.user) {
      res.send(null);
      return;
    }
    const user = await User.findById(req.session.user._id);
    res.send(user);
  }
);

route.post(
  "/register",
  check("firstName").trim().notEmpty().withMessage("first name is required"),
  check("lastName").trim().notEmpty().withMessage("last name is required"),
  check("email").trim().isEmail().withMessage("enter a valid email"),
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("password must be six characters minimum"),
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    } = req.body as { [key: string]: string };
    if (password !== confirmPassword) {
      throw new BadRequestError("passwords do not match");
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      throw new BadRequestError("A user with that email already exists");
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 8);

    const user = User.build({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: hashedPassword
    });
    await user.save();
    res.status(201).send(user);
  }
);

route.post(
  "/login",
  check("email").trim().isEmail().withMessage("please enter a valid email"),
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("password must be six characters minimum"),
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as { [key: string]: string };
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      throw new BadRequestError("Invalid email or password");
    }

    req.session!.user = user;
    req.session!.isLoggedIn = true;
    socket.getIO().emit("contacts", { action: "create", contact: user });
    res.send(user);
  }
);

route.get(
  "/all/contacts",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const contacts = await User.find({
      _id: { $nin: [req.session?.user._id] }
    }).sort({ createdAt: -1 });
    res.send(contacts);
  }
);

route.get(
  "/logout",
  async (req: Request, res: Response): Promise<void> => {
    req.session?.destroy(err => {
      if (err) {
        throw new NotAuthorizedError();
      }
    });
    res.redirect("/login");
  }
);

export { route as userRoutes };