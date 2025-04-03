import React, { useState, KeyboardEvent } from 'react';
import {
  Input,
  Wrap, // Use Wrap for responsive tag layout
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  useTheme,
} from '@chakra-ui/react';

interface TagInputProps {
  id: string;
  label: string;
  value: string[]; // Array of tags
  onChange: (tags: string[]) => void; // Callback when tags change
  placeholder?: string;
  helperText?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Type and press Enter...',
  helperText,
}) => {
  const [inputValue, setInputValue] = useState('');
  const theme = useTheme();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim() !== '') {
      event.preventDefault(); // Prevent form submission if inside a form
      const newTag = inputValue.trim();
      if (!value.includes(newTag)) { // Avoid duplicate tags
        onChange([...value, newTag]);
      }
      setInputValue(''); // Clear input
    }
    // Optional: Handle Backspace to remove the last tag if input is empty
    if (event.key === 'Backspace' && inputValue === '' && value.length > 0) {
      handleRemoveTag(value[value.length - 1]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <FormControl id={id}>
      <FormLabel>{label}</FormLabel>
      <Wrap spacing={2} mb={2}> {/* Wrap tags */} 
        {value.map((tag) => (
          <WrapItem key={tag}>
            <Tag
              size="md"
              borderRadius="full"
              variant="solid"
              // Use a color scheme from the theme or default
              colorScheme={theme.components.Tag?.defaultProps?.colorScheme || 'gray'}
            >
              <TagLabel>{tag}</TagLabel>
              <TagCloseButton onClick={() => handleRemoveTag(tag)} />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default TagInput;
