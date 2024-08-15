"use client";

import React from "react";
import Select, {
  components,
  MultiValueGenericProps,
  StylesConfig,
} from "react-select";
import styles from "./SelectHeader.module.css";
import { SelectedOptions, SnapshotInstanceData } from "../types";

interface OptionType {
  label: string;
  value: string;
}
const MAX_DISPLAYED_BADGES = 2;
const MultiValueContainer = (
  props: MultiValueGenericProps<OptionType, true>
) => {
  const { children, selectProps, data } = props;
  const selectedValues = selectProps.value as OptionType[];

  const index = selectedValues.findIndex(
    (selectedOption) => selectedOption.value === data.value
  );

  if (index < MAX_DISPLAYED_BADGES) {
    return (
      <components.MultiValueContainer {...props}>
        {children}
      </components.MultiValueContainer>
    );
  }

  if (index === MAX_DISPLAYED_BADGES) {
    const remainingBadgeCount = selectedValues.length - MAX_DISPLAYED_BADGES;
    return (
      <div className={styles.overflowBadge}>+{remainingBadgeCount} more</div>
    );
  }

  return null;
};

const SelectHeader = ({
  handleSelectedOptions,
  instanceData,
}: {
  handleSelectedOptions: (
    selectedOptions: string[] | keyof SelectedOptions,
    type: string
  ) => void;
  instanceData: SnapshotInstanceData;
}) => {
  const appOptions = instanceData?.app
    ? instanceData.app.map((instance: string) => ({
        value: instance,
        label: instance,
      }))
    : [];
  const browserOptions = instanceData?.browser
    ? instanceData.browser.map(
        (instance: { name: string; version: string }) => ({
          value: `${instance.name}-${instance.version}`,
          label: `${
            instance.name.charAt(0).toUpperCase() + instance.name.slice(1)
          } ${instance.version}`,
        })
      )
    : [];
  const deviceNameOptions = instanceData?.deviceName
    ? instanceData.deviceName.map((instance: string) => ({
        value: instance,
        label: instance.charAt(0).toUpperCase() + instance.slice(1),
      }))
    : [];
  const platformOptions = instanceData?.platform
    ? instanceData.platform.map(
        (instance: { name: string; version: string }) => ({
          value: `${instance.name}-${instance.version}`,
          label: `${
            instance.name.charAt(0).toUpperCase() + instance.name.slice(1)
          } ${instance.version}`,
        })
      )
    : [];
  const selectStyles: StylesConfig<OptionType, true> = {
    control: (originalStyles) => ({
      ...originalStyles,
      marginLeft: "0.5rem",
      borderColor: "white",
      backgroundColor: "black",
      width: "100%",
    }),
    menu: (originalStyles, {}) => ({
      ...originalStyles,
      backgroundColor: "black",
      borderColor: "white",
    }),
    option: (originalStyles, state) => ({
      ...originalStyles,
      backgroundColor: state.isFocused
        ? "transparent"
        : state.isSelected
        ? "white"
        : originalStyles.backgroundColor,
      color: state.isFocused
        ? "inherit"
        : state.isSelected
        ? "black"
        : originalStyles.color,
      ":active": {
        backgroundColor: "white",
        color: "black",
      },
      ":hover": {
        backgroundColor: "white",
        color: "black",
      },
    }),
    singleValue: (originalStyles) => ({
      ...originalStyles,
      color: "white",
    }),
  };
  return (
    <div className={styles.container}>
      <Select
        onChange={(selectedOption) =>
          // @ts-ignore
          handleSelectedOptions(selectedOption.value, "status")
        }
        placeholder="Select the Status"
        options={[
          { value: "all", label: "All" },
          { value: "passed", label: "Passed" },
          { value: "failed", label: "Failed" },
        ]}
        styles={selectStyles}
      />
      {appOptions.length > 0 && (
        <Select
          components={{ MultiValueContainer }}
          isMulti
          onChange={(selectedOptions) =>
            handleSelectedOptions(
              selectedOptions.map((option) => option.value),
              "app"
            )
          }
          placeholder="Select one or more apps"
          options={appOptions}
          styles={selectStyles}
        />
      )}
      {browserOptions.length > 0 && (
        <Select
          components={{ MultiValueContainer }}
          hideSelectedOptions={false}
          isMulti
          onChange={(selectedOptions) =>
            handleSelectedOptions(
              selectedOptions.map((option) => option.value),
              "browser"
            )
          }
          placeholder="Select one or more browsers"
          options={browserOptions}
          styles={selectStyles}
        />
      )}
      {deviceNameOptions.length > 0 && (
        <Select
          components={{ MultiValueContainer }}
          isMulti
          onChange={(selectedOptions) =>
            handleSelectedOptions(
              selectedOptions.map((option) => option.value),
              "device"
            )
          }
          placeholder="Select one or more devices"
          options={deviceNameOptions}
          styles={selectStyles}
        />
      )}
      {platformOptions.length > 0 && (
        <Select
          components={{ MultiValueContainer }}
          isMulti
          onChange={(selectedOptions) =>
            handleSelectedOptions(
              selectedOptions.map((option) => option.value),
              "platform"
            )
          }
          placeholder="Select one or more platforms"
          options={platformOptions}
          styles={selectStyles}
        />
      )}
    </div>
  );
};

export default SelectHeader;
