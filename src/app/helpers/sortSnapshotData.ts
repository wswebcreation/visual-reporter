import { DescriptionData } from "../types";

export const sortSnapshotData = (
  jsonData: DescriptionData[]
): DescriptionData[] => {
  return jsonData
    .sort((a, b) => a.description.localeCompare(b.description))
    .map((description) => ({
      ...description,
      data: description.data.map((test) => ({
        ...test,
        data: test.data.sort((methodA, methodB) => {
          const hasMismatchA = parseFloat(methodA.misMatchPercentage) > 0;
          const hasMismatchB = parseFloat(methodB.misMatchPercentage) > 0;

          if (hasMismatchA && !hasMismatchB) return -1;
          if (!hasMismatchA && hasMismatchB) return 1;

          const testCompare = methodA.test.localeCompare(methodB.test);
          if (testCompare !== 0) return testCompare;

          const platformCompare =
            methodA.instanceData.platform.name.localeCompare(
              methodB.instanceData.platform.name
            );
          if (platformCompare !== 0) return platformCompare;

          const platformVersionA = methodA.instanceData.platform.version || "";
          const platformVersionB = methodB.instanceData.platform.version || "";
          const platformVersionCompare =
            platformVersionA.localeCompare(platformVersionB);
          if (platformVersionCompare !== 0) return platformVersionCompare;

          const browserNameA = methodA.instanceData.browser?.name || "";
          const browserNameB = methodB.instanceData.browser?.name || "";
          const browserCompare = browserNameA.localeCompare(browserNameB);
          if (browserCompare !== 0) return browserCompare;

          const browserVersionA = methodA.instanceData.browser?.version || "";
          const browserVersionB = methodB.instanceData.browser?.version || "";
          const browserVersionCompare =
            browserVersionA.localeCompare(browserVersionB);
          if (browserVersionCompare !== 0) return browserVersionCompare;

          const appCompare = (methodA.instanceData.app || "").localeCompare(
            methodB.instanceData.app || ""
          );
          return appCompare;
        }),
      })),
    }));
};
