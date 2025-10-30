import { User } from "../models/user.model.js";

export const resolveUserEmail = async (parameters) => {
  if (parameters.email) return { email: parameters.email };
  if (parameters.id) return { id: parameters.id };

  if (parameters.name) {
    const users = await User.find({ name: { $regex: parameters.name, $options: "i" } });

    if (users.length === 1) {
      return { email: users[0].email };
    } else if (users.length > 1) {
      const userNames = users
        .map((u, i) => `${i + 1}. ${u.name} (${u.email})`)
        .join("<br /><br />");

      return {
        conflict: true,
        message:
          "I found multiple users with the same name:<br /><br />" +
          userNames +
          "<br /><br />Please specify which user you're referring to.",
      };
    } else {
      return { error: "No user found with name " + parameters.name };
    }
  }

  return { error: "No name or email provided." };
};
