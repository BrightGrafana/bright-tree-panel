# Interactive Tree Plugin

Welcome to the Interactive Tree Plugin, your solution for creating interactive Tree diagrams in Grafana 10.0+.

![Plugin Demo](https://equansdatahub.azureedge.net/grafana-tree-panel/tree-usage-demo.gif)

## How it Works

The Interactive Tree Panel is designed to visualize hierarchical data effortlessly. To use it effectively, make sure your dataset includes the following fields for each row:

- **Node ID**: Identifies each node uniquely.
- **Parent ID**: Specifies the parent node's ID for each node.
- **Node Name**: Describes the name or label of each node.

Don't worry if you have additional fields; the panel can handle them seamlessly. In the panel settings, you can customize the column names corresponding to Node ID, Parent ID, and Node Name.

The panel starts by identifying rows with NULL in the Parent ID field; these are considered root nodes. It then recursively adds child nodes by matching the Node ID of a root node with the Parent ID of other nodes.

![Hierarchical Data Example](https://equansdatahub.azureedge.net/grafana-tree-panel/hierarchical-tree-data-example.PNG)

## Panel Options

When configuring the panel, you have several customization options at your disposal:

- **Node ID field name**: Specify the field containing the node IDs.
- **Node label field name**: Define the field that holds the node labels.
- **Node parent ID field name**: Set the field containing the parent node IDs.
- **Expanded levels**: Control the number of expanded tree layers initially displayed.
- **Show item count**: Toggle to display the count of first-level child nodes for nodes with children.
- **Show Search**: toogle to display search bar
- **Order in each level**: Sort nodes by name in ascending, descending, or custom order.
- **Allow multi select using Ctrl-Click or Shift-Click**: Enable multiple node selection by holding the Ctrl or shift key.
- **Toggle mode**: customize toggle control allowing for `no toggle`, `toggle only on chevron`, `toggle on label and chevron`, `only expand on label`
- **Node click dashboard variable**: Define the dashboard variable to set when clicking a node or leaf.

![Plugin Options Demo](https://equansdatahub.azureedge.net/grafana-tree-panel/equans-grafana-tree-plugin-options-demo.gif)

With the Interactive Tree Plugin, you can effortlessly create interactive and informative tree diagrams to visualize your hierarchical data. Explore the possibilities and make your data come to life!
