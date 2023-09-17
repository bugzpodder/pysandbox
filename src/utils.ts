export const waitFor = (condition: () => boolean, checkInterval = 100) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!condition()) return;
      clearInterval(interval);
      resolve(undefined);
    }, checkInterval);
  });
};
