import React from "react";
import module from "./Layout.module.scss";

export default function Layout(props) {
  return <div className={module.layout}>{props.children}</div>;
}
