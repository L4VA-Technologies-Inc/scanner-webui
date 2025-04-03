import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Box, Heading, List, ListItem, Text, Flex, useColorModeValue, Tag } from '@chakra-ui/react';

interface EventTypeSelectorProps {
  availableTypes: string[];
  selectedTypes: string[];
  onChange: (newSelectedTypes: string[]) => void;
}

const grid = 8;

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 1.5, // Increased padding
  margin: `0 0 ${grid}px 0`,
  borderRadius: 'md', // Rounded corners
  boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : 'none', // Shadow when dragging

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'inherit', // Use theme background or specific color

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'lightblue' : 'inherit', // Use theme background or specific color
  padding: grid,
  width: '100%', // Ensure lists take full width of their container
  minHeight: '200px', // Minimum height for drop area
  border: '1px dashed gray', // Dashed border
  borderRadius: 'md', // Rounded corners
});

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  availableTypes,
  selectedTypes,
  onChange,
}) => {
  const itemBg = useColorModeValue('gray.100', 'gray.700');
  const listBg = useColorModeValue('gray.50', 'gray.900');

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Filter available types based on current selection *before* drag logic
    const currentAvailable = availableTypes.filter(
      (type) => !selectedTypes.includes(type)
    );

    // dropped outside the list
    if (!destination) {
      return;
    }

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;

    // Reordering within the same list - do nothing (or implement if needed)
    if (sourceId === destinationId) {
      return;
    }

    let newSelected = Array.from(selectedTypes);

    // Moving from available to selected
    if (sourceId === 'available' && destinationId === 'selected') {
      // Get the item that was dragged from the *currently visible* available list
      const itemToMove = currentAvailable[source.index];
      // Insert into the selected list at the destination index
      newSelected.splice(destination.index, 0, itemToMove);
    }
    // Moving from selected to available
    else if (sourceId === 'selected' && destinationId === 'available') {
      // Remove the item from the selected list at the source index
      newSelected.splice(source.index, 1);
    }

    // Update the parent component's state
    onChange(newSelected);
  };

  // Filter available types dynamically based on the current selectedTypes prop
  const currentAvailableTypes = availableTypes.filter(
    (type) => !selectedTypes.includes(type)
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Flex justify="space-between" gap={6}>
        {/* Available Types List */}
        <Box flex={1}>
          <Heading size="sm" mb={3} textAlign="center">Available Event Types</Heading>
          <Droppable droppableId="available">
            {(provided, snapshot) => (
              <List
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
                bg={listBg}
              >
                {currentAvailableTypes.length > 0 ? (
                  currentAvailableTypes.map((item, index) => (
                    <Draggable key={item} draggableId={item} index={index}>
                      {(provided, snapshot) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                          bg={itemBg}
                          _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
                        >
                          <Tag>{item}</Tag>
                        </ListItem>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <Text p={3} textAlign="center" color="gray.500">None available</Text>
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </Box>

        {/* Selected Types List */}
        <Box flex={1}>
          <Heading size="sm" mb={3} textAlign="center">Selected Event Types</Heading>
          <Droppable droppableId="selected">
            {(provided, snapshot) => (
              <List
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
                bg={listBg}
              >
                {selectedTypes.length > 0 ? (
                  selectedTypes.map((item, index) => (
                    <Draggable key={item} draggableId={item} index={index}>
                      {(provided, snapshot) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                          bg={itemBg}
                          _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
                        >
                          <Tag>{item}</Tag>
                        </ListItem>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <Text p={3} textAlign="center" color="gray.500">Drag types here</Text>
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </Box>
      </Flex>
    </DragDropContext>
  );
};

export default EventTypeSelector;
