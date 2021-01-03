console.log((window as any)._env_);

export const config = {
  SERVER_URI:
    process.env.NODE_ENV === "production"
      ? `${(window as any)._env_.SERVER_URI}:4000`
      : "localhost:4000",
};
