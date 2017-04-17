import functions from './functions-hard';
import functionsSmooth from './functions-smooth';

// HIGH PERFORMANCE MODULE
// Use var instead of let (10* faster)

export default function getFunction(model) {
  if (model.smooth && (model.type in functionsSmooth)) {
    return functionsSmooth[model.type];
  }
  return functions[model.type];
}
