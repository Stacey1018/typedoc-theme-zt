import {
  DeclarationReflection,
  DefaultThemeRenderContext,
  JSX,
  PageEvent,
  Reflection,
  ContainerReflection,
  ReflectionKind,
} from 'typedoc';

import { classNames, inPath, wbr, partition,renderName, getComment, getReadme } from './utils';
export function primaryNavigation(
  context: DefaultThemeRenderContext,
  props: PageEvent<DeclarationReflection>,
) {
  // Create the navigation for the current page

  const modules = props.model.project.getChildrenByKind(ReflectionKind.SomeModule);
  const [ext, int] = partition(modules, (m) => m.flags.isExternal);

  const selected = props.model.isProject();
  const current = selected || int.some((mod) => inPath(mod, props.model));

  function sub(selected:Boolean){
      if (!selected && props.model.isProject() && props.model.getChildrenByKind(ReflectionKind.Module).length) {
        return;
      }

      const effectivePageParent =
        (props.model instanceof ContainerReflection && props.model.children?.length) ||
        props.model.isProject()
          ? props.model
          : props.model.parent!;


      const children = (effectivePageParent as ContainerReflection).children || [];


      const pageNavigation = children
        .filter((child) => !child.kindOf(ReflectionKind.SomeModule))
        .map((child) => {
          return (
            <li
              class={classNames(
                { deprecated: child.isDeprecated(), current: props.model === child },
                child.cssClasses,
              )}
            >
              <a href={context.urlTo(child)} class="tsd-index-link">
                {context.icons[child.kind]()}
                <div>
                  {renderName(child)}
                  {getComment(child)}
                </div>
              </a>
            </li>
          );
        });

      if (effectivePageParent.kindOf(ReflectionKind.SomeModule | ReflectionKind.Project)) {
        // console.log(effectivePageParent)
        return (
          <nav class="tsd-navigation secondary menu-sticky">
            {!!pageNavigation.length && <ul>{pageNavigation}</ul>}
          </nav>
        );
      }

      return (
        <nav class="tsd-navigation secondary menu-sticky" >
        <ul>
          <li
            class={classNames(
              {
                deprecated: effectivePageParent.isDeprecated(),
                current: effectivePageParent === props.model,
              },
              effectivePageParent.cssClasses,
            )}
          >
            <a href={context.urlTo(effectivePageParent)} class="tsd-index-link">
              {context.icons[effectivePageParent.kind]()}
              <div>
                {renderName(effectivePageParent)}
                {getComment(props.model)}
              </div>
            </a>
            {!!pageNavigation.length && <ul>{pageNavigation}</ul>}
          </li>
        </ul>
      </nav>
      );
    }


  function link(mod: DeclarationReflection, fn: typeof getReadme | typeof getComment = getComment) {
    const current = inPath(mod, props.model);
    const selected = mod.name === props.model.name;
    let childNav: JSX.Element | undefined;
    const childModules = mod.children?.filter((m) => m.kindOf(ReflectionKind.SomeModule));
    if (childModules?.length) {
      childNav = <ul>{childModules.map((it) => link(it))}</ul>;
    }


    return (
      <li class={classNames({ current, selected, deprecated: mod.isDeprecated() }, mod.cssClasses)}>
        <a href={context.urlTo(mod)}>
          <div>
            {wbr(`${mod.name}${mod.version !== undefined ? ` - v${mod.version}` : ''}`)}
            {fn(mod)}
          </div>
        </a>
        {childNav}
        {sub(selected)}
      </li>
    );
  }

  // const comment = props.model.comment || props.model.signatures?.[0].comment
  // console.log(child.comment?.summary?.[0]?.text.split(/(\r\n)+/));
  // const commentContent = comment?.summary?.[0]?.text.split(/(\r\n)+/)[0];

  return (
    <nav class="tsd-navigation primary">
      <details class="tsd-index-accordion" open={true}>
        <summary class="tsd-accordion-summary">
          <h3>{context.icons.chevronDown()} Modules</h3>
        </summary>
        <div class="tsd-accordion-details">
          <ul class="modules">
            <li class={classNames({ current, selected }) + ' module'}>
              {/*<a href={context.urlTo(props.model.project)}>{wbr(props.project.name)}</a>*/}
              <ul>{int.map((i) => link(i, getReadme))}</ul>
            </li>
            {ext.map((i) => link(i))}
          </ul>
        </div>
      </details>
    </nav>
  );
}
