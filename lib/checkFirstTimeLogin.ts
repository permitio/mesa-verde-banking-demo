export function checkIfWithinLast30Seconds(timestamp: string): boolean {
    const providedTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
  
    const differenceInSeconds = (currentTime - providedTime) / 1000;
  
    return differenceInSeconds <= 30;
}
  