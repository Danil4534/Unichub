import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useLocation } from "react-router-dom";

const Breadcrumbs: React.FC = () => {
  const { pathname } = useLocation();
  const pathArr = pathname.split("/").filter(Boolean);
  const buildHref = (index: number) => {
    return "/" + pathArr.slice(0, index + 1).join("/");
  };
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <Breadcrumb className="w-2/4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/homepage">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {pathArr.slice(1).map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={buildHref(index)}>
                {capitalize(item)}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
