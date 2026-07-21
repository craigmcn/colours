import styles from "./ColorExample.module.scss";

interface Props {
  linkColor: string;
  textColor: string;
  bgColor: string;
}

export const ColorExample = ({ linkColor, textColor, bgColor }: Props) => (
  <div
    className={styles.exBg}
    style={{ backgroundColor: bgColor, borderColor: textColor }}
  >
    <p className={styles.exText} style={{ color: textColor }}>
      Foreground text{" "}
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- decorative preview of link styling, not a real navigation target */}
      <a href="#" className={styles.exLink} style={{ color: linkColor }}>
        link text
      </a>{" "}
      foreground text
    </p>
  </div>
);
