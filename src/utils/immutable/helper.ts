import { Map as ImmutableMap } from 'immutable';

/**
 * Convert an object to an immutable map and force the type
 */
export const makeImmutableObject = <InputType extends { [key: string]: any }, OutputType>(
  input: InputType
): OutputType => (ImmutableMap(input) as unknown) as OutputType;
