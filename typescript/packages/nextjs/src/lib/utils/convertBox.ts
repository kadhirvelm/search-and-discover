export function convertBox(boxString: string | null) {
    if (boxString == null) {
        return;
    }

    if (!boxString.includes("<box>")) {
        return;
    }

    const withoutBox = boxString.replaceAll("<box>", "").replaceAll("</box>", "");
    const numbers = withoutBox.split(",").map((num) => Number.parseFloat(num.trim()));

    const top = numbers[0];
    const left = numbers[1];
    const bottom = numbers[2];
    const right = numbers[3];

    const width = right - left;
    const height = bottom - top;

    return {
        left,
        top,
        width,
        height,
    }
}