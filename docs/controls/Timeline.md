# Timeline

A native timeline graph using d3 based on standard design patterns. Timeline graph is a graph with no Y Axis.
This is primarily used to denote an action at a given point of time. It also accepts/supplies a content property which can be used to display non-numeric values which typically cannot be represented using traditional graphs like Line or Paired Result.

-   [Timeline](#timeline)
    -   [Usage](#usage)
    -   [JSON Properties](#json-properties)
        -   [Root](#root)
            -   [Required](#required)
            -   [Optional](#optional)
        -   [Axis](#axis)
            -   [Required](#required-1)
            -   [Optional](#optional-1)
        -   [Data](#data)
            -   [Required](#required-2)
            -   [Optional](#optional-2)
        -   [Values](#values)
            -   [Required](#required-3)
            -   [Optional](#optional-3)
        -   [Structure](#structure)

## Usage

```javascript
var timelineDefault = Carbon.api.timeline(/* Add "input" JSON, shown below for example */);
timelineDefault.loadContent(/* Add "data" JSON, shown below for example */);
```

For loading multiple data-sets, you can load as additional content:

```javascript
var timelineDefault = Carbon.api.timeline(/* Add "input" JSON, shown below for example */);
timelineDefault.loadContent(/* Data array A */);
timelineDefault.loadContent(/* Data array B */);
timelineDefault.loadContent(/* Data array C */);
timelineDefault.loadContent(/* Data array D */);
```

## JSON Properties

### Root

#### Required

| Property Name | Expected | Description                   |
| ------------- | -------- | ----------------------------- |
| bindTo        | string   | DOM id to bind the graph into |
| axis          | object   | Refer [Axis](#axis)           |
| data          | array    | Refer [Data](#data)           |

#### Optional

| Property Name | Expected | Default                                       | Description                                                                          |
| ------------- | -------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| bindLegendTo  | string   | null                                          | If DOM id provided, binds legend into that container (Example: `"#legendContainer"`) |
| locale        | object   | LOCALE.en_US                                  | Locale object for X-Axis tick values                                                 |
| throttle      | number   | (1000/60) => time in ms                       | Delay between resize of a browser window                                             |
| showLabel     | boolean  | true                                          | Toggle to show X axis label                                                          |
| showLegend    | boolean  | true                                          | Toggle to show graph legend                                                          |
| padding       | object   | `{ top: 10, bottom: 5, left: 30, right: 50 }` | Refer [Padding](Padding.md)                                                          |

### Axis

Timeline is marked only on `X Axis`, there is no other axis supplied. Axis is set to `show` by default.

#### Required

| Property Name | Expected | Description                               |
| ------------- | -------- | ----------------------------------------- |
| lowerLimit    | string   | Upper bound for X axis. This is inclusive |
| upperLimit    | string   | Lower bound for X axis. This is inclusive |
| label         | string   | Axis label value.                         |

#### Optional

`X Axis` should have the following properties:

| Property Name | Expected | Default | Description                        |
| ------------- | -------- | ------- | ---------------------------------- |
| ticks         | object   | null    | Refer [Ticks](../helpers/Ticks.md) |

### Data

#### Required

| Property Name | Expected | Description                                                    |
| ------------- | -------- | -------------------------------------------------------------- |
| key           | string   | Unique id which represents the data-set                        |
| label         | object   | Display value for the data-set which the data points belong to |
| values        | Array    | [Values](#values)                                              |

#### Optional

| Property Name | Expected | Default       | Description                                                      |
| ------------- | -------- | ------------- | ---------------------------------------------------------------- |
| color         | string   | COLORS.BLACK  | Color for the data point and line                                |
| shape         | string   | SHAPES.CIRCLE | Shape for representing the data points                           |
| onClick       | Function | null          | Any action that can be performed when clicking on the data point |

### Values

#### Required

| Property Name | Expected           | Description                                                                                |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| x             | string             | Co-ordinate X, for plotting the data point (`Co-ordinate Y` is treated as `origin`)        |
| content       | `Consumer Defined` | Not required for processing the graph but required for providing data back to the consumer |

#### Optional

| Property Name | Expected | Default | Description                                           |
| ------------- | -------- | ------- | ----------------------------------------------------- |
| isCritical    | boolean  | false   | Shows an indicator surrounding the point when enabled |

### Structure

```javascript
var input = {
    bindTo: id,
    axis: {
        x: {
            label: "Datetime",
            lowerLimit: new Date(2016, 0, 1, 1, 0).toISOString(),
            upperLimit: new Date(2016, 0, 1, 15, 59).toISOString()
        }
    },
    showLabel: true,
    showLegend: true
};
var data = {
    key: "uid_1",
    label: {
        display: "Timeline A"
    },
    shape: Carbon.helpers.SHAPES.RHOMBUS,
    color: Carbon.helpers.COLORS.BLUE,
    onClick: (onCloseCB, key, index, value) => {
        // onCloseCB needs to called by the consumer after popup is closed to deselect data point.
    },
    values: [
        {
            x: new Date(2016, 0, 1, 1, 5).toISOString(),
            content: someContentFunction(),
            isCritical: true
        },
        {
            x: new Date(2016, 0, 1, 2, 15).toISOString(),
            content: "Some text content"
        }
    ]
};
```
