# Data Model: DataReference Details Rendering

## DataReference Field

| Attribute | Description |
|-----------|-------------|
| Display value | Human-readable value shown in Details. |
| Relationship property | Case property that identifies the related data record. |
| Selected context page | Record data used to match the relationship and resolve action parameters. |
| Target object class | Type used to confirm the matching relationship metadata. |

## Relationship Metadata

| Attribute | Description |
|-----------|-------------|
| Data source name | Data context used to open the referenced details view. |
| Parameters | Key/value pairs needed to load the referenced record. |
| Page class | Type of data record associated with the relationship. |

## State Flow

1. Details receives a field descriptor.
2. A DataReference field delegates rendering to the reference component.
3. The readonly reference resolves relationship metadata and data-source parameters.
4. Selecting the displayed value opens the referenced record details when a data context is available.
