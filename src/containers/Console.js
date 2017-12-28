import {connect} from 'react-redux';
import Console from '../components/Console';
import {
  getCurrentCompiledProjectKey,
  getConsoleHistory,
  getCurrentProjectKey,
  getHiddenUIComponents,
  isCurrentProjectSyntacticallyValid,
  isExperimental,
  isTextSizeLarge,
  getOutputColumnFlex,
} from '../selectors';
import {
  evaluateConsoleEntry,
  toggleComponent,
  storeResizableSectionRef,
  clearConsoleEntries,
} from '../actions';

function mapStateToProps(state) {
  return {
    currentCompiledProjectKey: getCurrentCompiledProjectKey(state),
    currentProjectKey: getCurrentProjectKey(state),
    history: getConsoleHistory(state),
    isEnabled: isExperimental(state),
    isOpen: !getHiddenUIComponents(state).includes('console'),
    isTextSizeLarge: isTextSizeLarge(state),
    outputColumnFlex: getOutputColumnFlex(state),
    showingErrors: !isCurrentProjectSyntacticallyValid(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onClearConsoleEntries() {
      dispatch(clearConsoleEntries());
    },

    onInput(input) {
      dispatch(evaluateConsoleEntry(input));
    },

    onToggleVisible(projectKey) {
      dispatch(toggleComponent(projectKey, 'console'));
    },

    onRef(ref) {
      dispatch(storeResizableSectionRef('output', 1, ref));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Console);
