export default function getResizableSectionFlex(state, section) {
  return state.getIn(['ui', 'workspace', section, 'flex']).toJS();
}
