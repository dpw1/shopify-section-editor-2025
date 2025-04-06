import Image from "next/image";
import styles from "./page.module.css";
import Editor from "./Editor";

export default function Home() {
  return (
    <div className={styles.page}>
      <Editor></Editor>
      hi
    </div>
  );
}
