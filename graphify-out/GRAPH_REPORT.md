# Graph Report - packages/dynamic-forms (2026-04-23)

## Corpus Check

- Large corpus: 453 files · ~309,859 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary

- 1883 nodes · 2697 edges · 108 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 560 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- [[_COMMUNITY_Derivation Orchestration|Derivation Orchestration]]
- [[_COMMUNITY_Function Registry & Logic Functions|Function Registry & Logic Functions]]
- [[_COMMUNITY_Provider Wiring & Wrapper Injection|Provider Wiring & Wrapper Injection]]
- [[_COMMUNITY_Form State Machine & Manager|Form State Machine & Manager]]
- [[_COMMUNITY_Logic Expressions & Conditionals|Logic Expressions & Conditionals]]
- [[_COMMUNITY_Field Tree Mapping|Field Tree Mapping]]
- [[_COMMUNITY_ArrayPage Field Components|Array/Page Field Components]]
- [[_COMMUNITY_Test Harnesses & DynamicFormTestUtils|Test Harnesses & DynamicFormTestUtils]]
- [[_COMMUNITY_Core Field Mappers|Core Field Mappers]]
- [[_COMMUNITY_Validator Factory & Dynamic Values|Validator Factory & Dynamic Values]]
- [[_COMMUNITY_Event Bus & Array Events|Event Bus & Array Events]]
- [[_COMMUNITY_Expression Parser|Expression Parser]]
- [[_COMMUNITY_Field Definitions (Core)|Field Definitions (Core)]]
- [[_COMMUNITY_Conditions & Schema Builder|Conditions & Schema Builder]]
- [[_COMMUNITY_Cross-Field Detection|Cross-Field Detection]]
- [[_COMMUNITY_Wrapper Chain & Field Outlet|Wrapper Chain & Field Outlet]]
- [[_COMMUNITY_Page Orchestrator & Init Tracking|Page Orchestrator & Init Tracking]]
- [[_COMMUNITY_Integration Field Definitions|Integration Field Definitions]]
- [[_COMMUNITY_Integration Mappers|Integration Mappers]]
- [[_COMMUNITY_Simple Test Utilities|Simple Test Utilities]]
- [[_COMMUNITY_Form Config Factory & Helpers|Form Config Factory & Helpers]]
- [[_COMMUNITY_Container Fields (GroupArray)|Container Fields (Group/Array)]]
- [[_COMMUNITY_Integration Array Button Mappers|Integration Array Button Mappers]]
- [[_COMMUNITY_Config Normalization & Validation|Config Normalization & Validation]]
- [[_COMMUNITY_Derivation Logger|Derivation Logger]]
- [[_COMMUNITY_Type-Level Field Registry|Type-Level Field Registry]]
- [[_COMMUNITY_Field Context Registry|Field Context Registry]]
- [[_COMMUNITY_Library Documentation|Library Documentation]]
- [[_COMMUNITY_Expression Evaluator|Expression Evaluator]]
- [[_COMMUNITY_Submission Integration Tests|Submission Integration Tests]]
- [[_COMMUNITY_Event Bus Tests|Event Bus Tests]]
- [[_COMMUNITY_State Machine Tests|State Machine Tests]]
- [[_COMMUNITY_utils wrapper-chain.spec.ts|utils: wrapper-chain.spec.ts]]
- [[_COMMUNITY_wrappers RowWrapperComponent|wrappers: RowWrapperComponent]]
- [[_COMMUNITY_utils resolveField()|utils: resolveField()]]
- [[_COMMUNITY_wrappers createWrappers()|wrappers: createWrappers()]]
- [[_COMMUNITY_core field-state-extractor.spec.ts|core: field-state-extractor.spec.ts]]
- [[_COMMUNITY_utils interpolateParams()|utils: interpolateParams()]]
- [[_COMMUNITY_pipes DynamicTextPipe|pipes: DynamicTextPipe]]
- [[_COMMUNITY_integration Page Orchestration Integration|integration: Page Orchestration Integration]]
- [[_COMMUNITY_mappers array-button.mapper.spec.ts|mappers: array-button.mapper.spec.ts]]
- [[_COMMUNITY_utils injectFieldRegistry()|utils: injectFieldRegistry()]]
- [[_COMMUNITY_utils inject-field-registry.spec.ts|utils: inject-field-registry.spec.ts]]
- [[_COMMUNITY_utils withPreviousValue()|utils: withPreviousValue()]]
- [[_COMMUNITY_utils createDebouncedSignal()|utils: createDebouncedSignal()]]
- [[_COMMUNITY_errors DynamicFormError|errors: DynamicFormError]]
- [[_COMMUNITY_events event-dispatcher.spec.ts|events: event-dispatcher.spec.ts]]
- [[_COMMUNITY_integration SignalFormsAdapterService Unit|integration: SignalFormsAdapterService Unit]]
- [[_COMMUNITY_core render-ready-metadata.spec.ts|core: render-ready-metadata.spec.ts]]
- [[_COMMUNITY_core validator-factory.spec.ts|core: validator-factory.spec.ts]]
- [[_COMMUNITY_fields TextFieldComponent|fields: TextFieldComponent]]
- [[_COMMUNITY_models RowAllowedChildren|models: RowAllowedChildren]]
- [[_COMMUNITY_providers provideDynamicForm type tests|providers: provideDynamicForm type tests]]
- [[_COMMUNITY_TestClass|TestClass]]
- [[_COMMUNITY_text-field.component.spec.ts|text-field.component.spec.ts]]
- [[_COMMUNITY_ArrayItemDefinition|ArrayItemDefinition]]
- [[_COMMUNITY_array-event-handler tests|array-event-handler tests]]
- [[_COMMUNITY_dynamic-forms vite config (browser mode)|dynamic-forms vite config (browser mode)]]
- [[_COMMUNITY_Gotcha Firefox E2E flakiness|Gotcha: Firefox E2E flakiness]]
- [[_COMMUNITY_dynamic-forms ESLint config|dynamic-forms ESLint config]]
- [[_COMMUNITY_TextareaProps interface|TextareaProps interface]]
- [[_COMMUNITY_TextareaWrap type|TextareaWrap type]]
- [[_COMMUNITY_BaseArrayAddButtonField|BaseArrayAddButtonField]]
- [[_COMMUNITY_BaseArrayRemoveButtonField|BaseArrayRemoveButtonField]]
- [[_COMMUNITY_dynamic-forms package barrel|dynamic-forms package barrel]]
- [[_COMMUNITY_CrossFieldCategory|CrossFieldCategory]]
- [[_COMMUNITY_ARRAY_PLACEHOLDER (.$.)|ARRAY_PLACEHOLDER (.$.)]]
- [[_COMMUNITY_MAX_AST_CACHE_SIZE (=1000)|MAX_AST_CACHE_SIZE (=1000)]]
- [[_COMMUNITY_DERIVATION_KEY_DELIMITER (x00)|DERIVATION_KEY_DELIMITER (\x00)]]
- [[_COMMUNITY_DerivationChainContext|DerivationChainContext]]
- [[_COMMUNITY_DerivationProcessingResult|DerivationProcessingResult]]
- [[_COMMUNITY_CycleDetectionResult|CycleDetectionResult]]
- [[_COMMUNITY_DerivationApplicatorContext|DerivationApplicatorContext]]
- [[_COMMUNITY_HttpDerivationStreamContext|HttpDerivationStreamContext]]
- [[_COMMUNITY_AsyncDerivationStreamContext|AsyncDerivationStreamContext]]
- [[_COMMUNITY_derivation-collector tests|derivation-collector tests]]
- [[_COMMUNITY_async-derivation-stream tests|async-derivation-stream tests]]
- [[_COMMUNITY_http-request-resolver tests|http-request-resolver tests]]
- [[_COMMUNITY_http-response-evaluator tests|http-response-evaluator tests]]
- [[_COMMUNITY_CustomFunctionOptions|CustomFunctionOptions]]
- [[_COMMUNITY_CustomFunctionScope type|CustomFunctionScope type]]
- [[_COMMUNITY_property-derivation-types spec suite|property-derivation-types spec suite]]
- [[_COMMUNITY_property-override-key spec suite|property-override-key spec suite]]
- [[_COMMUNITY_NextPageEvent tests|NextPageEvent tests]]
- [[_COMMUNITY_PreviousPageEvent tests|PreviousPageEvent tests]]
- [[_COMMUNITY_MoveArrayItemEvent tests|MoveArrayItemEvent tests]]
- [[_COMMUNITY_SubmitEvent tests|SubmitEvent tests]]
- [[_COMMUNITY_fieldsindex.ts barrel|fields/index.ts barrel]]
- [[_COMMUNITY_WithInputSignals|WithInputSignals]]
- [[_COMMUNITY_FieldOption|FieldOption]]
- [[_COMMUNITY_FieldWrapperContract|FieldWrapperContract]]
- [[_COMMUNITY_GroupAllowedChildren|GroupAllowedChildren]]
- [[_COMMUNITY_ArrayAllowedChildren|ArrayAllowedChildren]]
- [[_COMMUNITY_FormMode type|FormMode type]]
- [[_COMMUNITY_FieldPathAccess|FieldPathAccess]]
- [[_COMMUNITY_LogicTrigger|LogicTrigger]]
- [[_COMMUNITY_validation models barrel|validation models barrel]]
- [[_COMMUNITY_omit  keyBy  mapValues helpers|omit / keyBy / mapValues helpers]]
- [[_COMMUNITY_createResolvedErrorsSignal Spec|createResolvedErrorsSignal Spec]]
- [[_COMMUNITY_deprecation-warnings Spec|deprecation-warnings Spec]]
- [[_COMMUNITY_shouldShowErrors tests|shouldShowErrors tests]]
- [[_COMMUNITY_utilsindex barrel|utils/index barrel]]
- [[_COMMUNITY_object-utils tests|object-utils tests]]
- [[_COMMUNITY_interpolateParams tests|interpolateParams tests]]
- [[_COMMUNITY_applyMetaToElement tests|applyMetaToElement tests]]
- [[_COMMUNITY_resolve-wrappers tests|resolve-wrappers tests]]
- [[_COMMUNITY_Form Submission Integration tests|Form Submission Integration tests]]
- [[_COMMUNITY_ng-forge Dynamic Forms Logo|ng-forge Dynamic Forms Logo]]

## God Nodes (most connected - your core abstractions)

1. `FunctionRegistryService` - 40 edges
2. `DerivationOrchestrator` - 30 edges
3. `FormStateMachine` - 30 edges
4. `Parser` - 27 edges
5. `FormStateManager` - 25 edges
6. `DynamicFormTestUtils` - 24 edges
7. `EventBus` - 23 edges
8. `applyValidator()` - 19 edges
9. `evaluateCondition()` - 18 edges
10. `ArrayFieldComponent` - 18 edges

## Surprising Connections (you probably didn't know these)

- `cross-field-collector tests` --conceptually_related_to--> `applyCrossFieldTreeValidator()` [INFERRED]
  packages/dynamic-forms/src/lib/core/cross-field/cross-field-collector.spec.ts → /Users/antimprisacaru/WebstormProjects/dynamic-form-lib/ng-forge/packages/dynamic-forms/src/lib/core/schema-builder.ts
- `ExpressionParserError` --conceptually_related_to--> `TokenType (enum)` [INFERRED]
  /Users/antimprisacaru/WebstormProjects/dynamic-form-lib/ng-forge/packages/dynamic-forms/src/lib/core/expressions/parser/types.ts → packages/dynamic-forms/src/lib/core/expressions/parser/types.ts
- `property-derivation-applicator tests` --conceptually_related_to--> `buildPropertyOverrideKey()` [INFERRED]
  packages/dynamic-forms/src/lib/core/property-derivation/property-derivation-applicator.spec.ts → /Users/antimprisacaru/WebstormProjects/dynamic-form-lib/ng-forge/packages/dynamic-forms/src/lib/core/property-derivation/property-override-key.ts
- `resolveWrappers()` --conceptually_related_to--> `WrapperFieldInputs (interface)` [INFERRED]
  /Users/antimprisacaru/WebstormProjects/dynamic-form-lib/ng-forge/packages/dynamic-forms/src/lib/utils/resolve-wrappers/resolve-wrappers.ts → packages/dynamic-forms/src/lib/wrappers/wrapper-field-inputs.ts
- `ArrayFieldComponent` --shares_data_with--> `ArrayItemContext` [INFERRED]
  /Users/antimprisacaru/WebstormProjects/dynamic-form-lib/ng-forge/packages/dynamic-forms/src/lib/fields/array/array-field.component.ts → packages/dynamic-forms/src/lib/events/interfaces/array-item-context.ts

## Hyperedges (group relationships)

- **Form lifecycle: state manager + state machine + side effect scheduler** — claude_md_concept_formstatemanager, claude_md_concept_formstatemachine, claude_md_concept_sideeffectscheduler, claude_md_concept_field_resolution_pipeline [EXTRACTED 0.90]
- **InputField discriminated union (Number/String variants keyed by props.type)** — input_field_inputfield, input_field_numberinputfield, input_field_stringinputfield, input_field_inputprops [EXTRACTED 0.95]
- **Options-bearing value fields (select, radio, multi-checkbox)** — select_field_selectfield, radio_field_radiofield, multi_checkbox_field_multicheckboxfield [INFERRED 0.85]
- **Array Button Mapper Family (shared logic pattern)** — array_button_mapper_addarrayitembuttonmapper, array_button_mapper_prependarrayitembuttonmapper, array_button_mapper_insertarrayitembuttonmapper, array_button_mapper_removearrayitembuttonmapper, array_button_mapper_poparrayitembuttonmapper, array_button_mapper_shiftarrayitembuttonmapper [EXTRACTED 0.95]
- **Value Field Mapper Specializations (slider/textarea/datepicker/options extend value base)** — value_field_mapper_buildvaluefieldinputs, slider_field_mapper_sliderfieldmapper, textarea_field_mapper_textareafieldmapper, datepicker_field_mapper_datepickerfieldmapper, options_field_mapper_optionsfieldmapper [EXTRACTED 0.95]
- **Navigation Button Mappers (submit/next/previous)** — navigation_button_mapper_submitbuttonfieldmapper, navigation_button_mapper_nextbuttonfieldmapper, navigation_button_mapper_previousbuttonfieldmapper, non_field_logic_utils_resolvehiddenvalue [EXTRACTED 0.90]
- **Form Schema Application Pipeline** — schema_builder_createschemafromfields, form_mapping_mapfieldtoform, schema_application_applyschema, form_schema_merger_applyformlevelschema [INFERRED 0.90]
- **Cross-Field Validation Evaluation Chain** — schema_builder_applycrossfieldtreevalidator, schema_builder_evaluatecrossfieldvalidator, schema_builder_evaluatecustomcrossfieldvalidator, schema_builder_evaluatebuiltincrossfieldvalidator, schema_builder_applybuiltinvalidationlogic [EXTRACTED 1.00]
- **Standard Schema Integration API** — standard_schema_marker_standardschema, standard_schema_marker_isstandardschemamarker, standard_schema_marker_formschema, form_schema_merger_applyformlevelschema [EXTRACTED 0.95]
- **Derivation processing pipeline: collect -> sort -> apply** — derivation_collector_collectderivations, derivation_sorter_topologicalsort, derivation_applicator_applyderivations, derivation_orchestrator_derivationorchestrator [EXTRACTED 0.95]
- **Async derivation streams (HTTP + async function) share the same stream pattern (debounceTime + switchMap + stopOnUserOverride)** — http_derivation_stream_createhttpderivationstream, async_derivation_stream_createasyncderivationstream, derivation_orchestrator_setuphttpstreams, derivation_orchestrator_setupasyncfunctionstreams [INFERRED 0.90]
- **Cross-field collection: detection + traversal + entry creation** — cross_field_detector_iscrossfieldexpression, cross_field_collector_collectcrossfieldentries, cross_field_collector_trycreatevalidatorentry, cross_field_collector_trycreatelogicentry, cross_field_collector_trycreateschemaentry [EXTRACTED 0.95]
- **Derivation cycle detection pipeline** — cycle_detector_validatenocycles, cycle_detector_detectcycles, cycle_detector_builddependencygraph, cycle_detector_detectcycleswithdfs, cycle_detector_dfsvisit [EXTRACTED 0.95]
- **Non-field element logic resolution family (hidden/disabled for buttons and text fields)** — non_field_logic_resolver_resolvesubmitbuttondisabled, non_field_logic_resolver_resolvenextbuttondisabled, non_field_logic_resolver_evaluatenonfieldhidden, non_field_logic_resolver_evaluatenonfielddisabled, non_field_logic_resolver_evaluatelogiccondition [INFERRED 0.85]
- **SSR-safe DI-scoped caches (replace module-scoped state)** — dynamic_value_function_cache_service_dynamicvaluefunctioncacheservice, http_condition_cache_httpconditioncache, http_condition_cache_http_condition_cache_token [INFERRED 0.80]
- **Logic function dispatch pattern (sync + async + http)** — logic_function_factory_createlogicfunction, async_condition_logic_function_createasyncconditionlogicfunction, http_condition_logic_function_createhttpconditionlogicfunction, condition_evaluator_evaluatecondition [INFERRED 0.90]
- **DI-scoped cache services (SSR-safe)** — logic_function_cache_service_logicfunctioncacheservice, async_condition_function_cache_service_asyncconditionfunctioncacheservice, http_condition_function_cache_service_httpconditionfunctioncacheservice [INFERRED 0.90]
- **Safe expression evaluation pipeline (parse + evaluate)** — evaluator_evaluator, evaluator_safe_methods, evaluator_blocked_properties, expression_parser_expressionparser [INFERRED 0.85]
- **Property derivation collect-apply-store pipeline** — property_derivation_collector_collectpropertyderivations, property_derivation_applicator_applypropertyderivations, property_override_store_propertyoverridestore, property_derivation_orchestrator_propertyderivationorchestrator [EXTRACTED 0.95]
- **Expression parser stack (facade, parser, AST, errors)** — expression_parser_expressionparser, parser_parser, types_astnode, types_expressionparsererror [EXTRACTED 0.95]
- **Core registry services (function/schema/root-form/field-context)** — function_registry_service_functionregistryservice, schema_registry_service_schemaregistryservice, root_form_registry_service_rootformregistryservice, field_context_registry_service_fieldcontextregistryservice [EXTRACTED 0.90]
- **HTTP validator dispatch pipeline** — validator_factory_applyunifiedhttpvalidator, validator_factory_applyfunctionhttpvalidator, validator_factory_applydeclarativehttpvalidator [EXTRACTED 0.95]
- **custom validator factory pipeline** — validator_factory_applycustomvalidator, validator_factory_createexpressionvalidator, validator_factory_createfunctionvalidator [EXTRACTED 0.95]
- **container field nesting restrictions (page/row/group/array nullable)** — page_field_pagefield, row_field_rowfield, page_field_validatepagenesting, row_field_validaterownesting, nullable_container_restriction_type_test_suite [INFERRED 0.85]
- **Container Field Family (group/array/container all use ContainerLogicConfig and extend FieldDef<never>)** — group_field_groupfield, array_field_arrayfield, container_field_containerfield, container_logic_config_containerlogicconfig [INFERRED 0.85]
- **Field Definition Inheritance Hierarchy (FieldDef is base, BaseValueField + BaseCheckedField extend it with FieldWithValidation)** — field_def_fielddef, base_value_field_basevaluefield, base_checked_field_basecheckedfield, field_with_validation_fieldwithvalidation [EXTRACTED 0.95]
- **Field Rendering Pipeline (DynamicForm uses DfFieldOutlet to render ResolvedFields)** — dynamic_form_component_dynamicform, df_field_outlet_directive_dffieldoutlet, field_def_fielddef [EXTRACTED 0.90]
- **arrayEvent builder + 7 array mutation events** — array_event_arrayevent, append_array_item_event_appendarrayitemevent, prepend_array_item_event_prependarrayitemevent, pop_array_item_event_poparrayitemevent, shift_array_item_event_shiftarrayitemevent, remove_at_index_event_removeatindexevent [EXTRACTED 0.95]
- **Pub/Sub event flow: Dispatcher forwards to Bus which routes to FormEvent subscribers** — event_dispatcher_eventdispatcher, event_bus_eventbus, array_event_arrayevent [EXTRACTED 0.90]
- **Barrel re-exports all public event APIs** — index_events_barrel, event_bus_eventbus, array_event_arrayevent, append_array_item_event_appendarrayitemevent, form_reset_event_formresetevent [EXTRACTED 0.90]
- **FormEvent base interface and concrete event implementations** — form_event_formevent, previous_page_event_previouspageevent, next_page_event_nextpageevent, move_array_item_event_movearrayitemevent, insert_array_item_event_insertarrayitemevent, submit_event_submitevent, form_clear_event_formclearevent [EXTRACTED 1.00]
- **Array item mutation event family (append/insert/move/pop/shift/remove)** — append_array_item_event_spec_appendarrayitemevent, insert_array_item_event_insertarrayitemevent, move_array_item_event_movearrayitemevent, pop_array_item_event_spec_poparrayitemevent, shift_array_item_event_spec_shiftarrayitemevent, remove_at_index_event_spec_removeatindexevent, array_field_component_arrayfieldcomponent [INFERRED 0.85]
- **Page wizard navigation event flow** — next_page_event_nextpageevent, previous_page_event_previouspageevent, page_change_event_spec_pagechangeevent, page_navigation_state_change_event_spec_pagenavigationstatechangeevent, page_field_component_pagefieldcomponent [INFERRED 0.85]
- **Container mappers share applyHiddenLogic pattern** — array_field_mapper_arrayfieldmapper, group_field_mapper_groupfieldmapper, container_field_mapper_containerfieldmapper, apply_hidden_logic_applyhiddenlogic [EXTRACTED 0.95]
- **Container field components share resolution pipeline** — group_field_component_groupfieldcomponent, container_field_component_containerfieldcomponent, group_field_component_resolvedfields, container_field_component_resolvedfields [INFERRED 0.85]
- **Developer experience helpers for form authoring** — create_field_createfield, create_field_field, form_config_formconfig [INFERRED 0.80]
- **Field-to-inputs mapper family** — base_field_mapper_basefieldmapper, row_field_mapper_rowfieldmapper, text_field_mapper_textfieldmapper [INFERRED 0.90]
- **Wrapper registry DI tokens** — wrapper_type_wrapper_registry, wrapper_type_wrapper_component_cache, wrapper_type_wrapper_auto_associations [INFERRED 0.85]
- **Form mode detection and validation** — form_mode_detectformmode, form_mode_hasanypagefields, form_mode_hasnestedpagefields, form_mode_isvalidpagedform [INFERRED 0.90]
- **HTTP-driven logic configuration triad** — http_request_config_httprequestconfig, validator_config_declarativehttpvalidatorconfig, logic_config_derivationlogicconfig, conditional_expression_httpcondition [INFERRED 0.85]
- **ConditionalExpression discriminated union variants** — conditional_expression_fieldvaluecondition, conditional_expression_customcondition, conditional_expression_javascriptcondition, conditional_expression_httpcondition, conditional_expression_asynccondition, conditional_expression_andcondition, conditional_expression_orcondition [EXTRACTED 1.00]
- **ValidatorConfig discriminated union variants** — validator_config_builtinvalidatorconfig, validator_config_customvalidatorconfig, validator_config_asyncvalidatorconfig, validator_config_functionhttpvalidatorconfig, validator_config_declarativehttpvalidatorconfig [EXTRACTED 1.00]
- **Logger feature trio (strategy + DI feature)** — logger_interface_logger, console_logger_consolelogger, noop_logger_nooplogger, with_logger_config_withloggerconfig [INFERRED 0.90]
- **provideDynamicForm registration flow** — dynamic_form_providers_providedynamicform, built_in_fields_builtinfields, built_in_fields_builtinwrappers, dynamic_form_feature_isdynamicformfeature [INFERRED 0.90]
- **Feature extensibility system** — dynamic_form_feature_dynamicformfeature, dynamic_form_feature_createfeature, dynamic_form_feature_isdynamicformfeature, with_logger_config_withloggerconfig [INFERRED 0.85]
- **Form Lifecycle State Machine** — form_state_manager_formstatemanager, form_state_machine_formstatemachine, side_effect_scheduler_sideeffectscheduler, state_types_formlifecyclestate [EXTRACTED 0.95]
- **State Discriminants (Lifecycle/Phase/Action/Effect)** — state_types_lifecyclestate, state_types_phase, state_types_action, state_types_effect [EXTRACTED 0.90]
- **DynamicForm Feature Creators (withXxx)** — with_value_exclusion_defaults_withvalueexclusiondefaults, with_event_form_value_witheventformvalue [INFERRED 0.85]
- **Wrapper chain rendering pipeline** — wrapper_chain_controller_createwrapperchaincontroller, wrapper_chain_renderwrapperchain, wrapper_chain_loadwrappercomponents, wrapper_chain_setinputifdeclared [EXTRACTED 0.90]
- **Simplified array normalization pipeline** — normalize_simplified_arrays_normalizesimplifiedarrays, normalize_simplified_arrays_expandsimplifiedarray, normalized_array_metadata_setnormalizedarraymetadata, normalize_simplified_arrays_buildobjectitem, normalize_simplified_arrays_buildremovebutton [EXTRACTED 0.90]
- **Array item resolution + injector creation** — resolve_array_item_resolvearrayitem, create_array_item_injector_createarrayiteminjectorandinputs, create_array_item_injector_createiteminjector, array_field_types_resolvedarrayitem [EXTRACTED 0.90]
- **Config validation pipeline: traverse, dedupe keys, verify types, validate regex** — config_validator_validateformconfig, config_validator_collectfielddata, config_validator_validatenoduplicatekeys, config_validator_validatefieldtypesregistered, config_validator_validateregexpattern [EXTRACTED 0.95]
- **Container field processors memoization pattern (flatten, keyBy, defaults)** — container_field_processors_createcontainerfieldprocessors, container_field_processors_container_field_processors_token, default_value_getfielddefaultvalue [EXTRACTED 0.90]
- **Array event normalization to ArrayAction stream** — array_event_handler_arrayevent, array_event_handler_arrayaction, array_event_handler_toarrayaction, array_event_handler_observearrayactions [EXTRACTED 0.95]
- **Field resolution & render-ready pipeline** — resolve_field_resolvefield, resolve_field_reconcilefields, resolve_field_createrenderreadysignal, resolve_field_createfieldresolutionpipe [EXTRACTED 0.95]
- **Component initialization event flow (emit -> track -> setup)** — emit_initialization_emitcomponentinitialized, initialization_tracker_createinitializationtracker, initialization_tracker_setupinitializationtracking [INFERRED 0.90]
- **Array placeholder path parsing & resolution** — path_utils_parsearraypath, path_utils_resolvearraypath, path_utils_parsemultiarraypath, path_utils_resolvemultiarraypath [EXTRACTED 0.90]
- **Built-in wrapper types (css + row)** — create_wrappers_createwrappers, css_wrapper_component_csswrappercomponent, row_wrapper_component_rowwrappercomponent [INFERRED 0.85]
- **Test harness components registered by DynamicFormTestUtils** — test_input_harness_testinputharness, test_select_harness_testselectharness, test_checkbox_harness_testcheckboxharness, test_button_harness_testbuttonharness, dynamic_form_test_utils_dynamicformtestutils [EXTRACTED 1.00]
- **Integration test suite for forms/logic/submission** — button_logic_integration_spec_tests, logic_transformation_integration_spec_tests, signal_forms_integration_spec_tests, submission_integration_spec_tests, signal_forms_adapter_unit_spec_tests [INFERRED 0.85]
- **Signal Forms Integration Test Suite** — form_mapping_integration_spec_suite, validator_transformation_integration_spec_suite, api_pattern_test_spec_suite [INFERRED 0.85]
- **Testing utilities family (mapper, simple, types)** — mapper_test_utils_createtestforminjector, simple_test_utils_simpletestutils, test_types_testconfig [INFERRED 0.80]
- **Page orchestration validation triad (mode, validity-guard, auto-redirect)** — page_orchestration_spec_suite, page_orchestration_spec_page_validity_guard, page_orchestration_spec_hidden_page_auto_redirect [INFERRED 0.90]

## Communities

### Community 0 - "Derivation Orchestration"

Cohesion: 0.03
Nodes (77): createAsyncDerivationStream(), createCollection(), applyDerivations(), applyDerivationsForTrigger(), computeDerivedValue(), createArrayItemEvaluationContext(), createEvaluationContext(), evaluateDerivationCondition() (+69 more)

### Community 1 - "Function Registry & Logic Functions"

Cohesion: 0.03
Nodes (35): AsyncConditionFunctionCacheService, createAsyncConditionLogicFunction(), Async Condition Logic Function Tests, registryWith(), buildDependencyGraph(), detectBidirectionalPairs(), detectCycles(), detectCyclesWithDFS() (+27 more)

### Community 2 - "Provider Wiring & Wrapper Injection"

Cohesion: 0.03
Nodes (55): setupArrayTest(), setupNestedObjectArrayTest(), BUILT_IN_FIELDS, BUILT_IN_WRAPPERS, DISPLAY_FIELD_TYPES_BASE, BUILT_IN_FIELDS spec, ConsoleLogger, ConsoleLogger spec (+47 more)

### Community 3 - "Form State Machine & Manager"

Cohesion: 0.05
Nodes (34): derivedFromDeferred(), isSignalArray(), isSignalRecord(), derived-from-deferred tests, createFormStateMachine(), FormStateMachine, FormStateMachine Spec, form() (+26 more)

### Community 4 - "Logic Expressions & Conditionals"

Cohesion: 0.05
Nodes (66): AndCondition, AsyncCondition, ComparisonOperator, ConditionalExpression union, CustomCondition, FieldValueCondition, HttpCondition, JavascriptCondition (+58 more)

### Community 5 - "Field Tree Mapping"

Cohesion: 0.05
Nodes (53): isArrayField(), isSimplifiedArrayField(), isContainerTypedField(), FlattenedField (interface), flattenFields(), field-flattener tests, getFieldValueHandling(), ValueHandlingMode (+45 more)

### Community 6 - "Array/Page Field Components"

Cohesion: 0.05
Nodes (31): AppendArrayItemEvent tests, ArrayFieldComponent, ArrayFieldComponent tests, determineDifferentialOperation(), DifferentialUpdateOperation, getArrayValue(), ResolvedArrayItem, ResolvedArrayItemField (+23 more)

### Community 7 - "Test Harnesses & DynamicFormTestUtils"

Cohesion: 0.04
Nodes (18): OutletHostComponent, setupAndResolve(), TestLeafComponent, TestRequiredKeyComponent, TestSectionWrapper, DynamicFormTestUtils, FormConfigBuilder, DynamicFormTestUtils spec (+10 more)

### Community 8 - "Core Field Mappers"

Cohesion: 0.06
Nodes (40): applyHiddenLogic(), applyPropertyOverrides(), KNOWN_FIELD_PROPERTIES, applyPropertyOverrides tests, arrayFieldMapper(), arrayFieldMapper Spec, baseFieldMapper(), buildBaseInputs() (+32 more)

### Community 9 - "Validator Factory & Dynamic Values"

Cohesion: 0.06
Nodes (39): async & HTTP validator integration tests, createDeprecationWarningTracker(), DEPRECATION_WARNING_TRACKER token, DeprecationWarningTracker, warnDeprecated(), logMaxIterationsReached(), createDynamicValueFunction(), dynamic-value-factory integration tests (+31 more)

### Community 10 - "Event Bus & Array Events"

Cohesion: 0.06
Nodes (22): AppendArrayItemEvent, ArrayItemDefinitionTemplate, arrayEvent(), arrayEvent builder tests, ComponentInitializedEvent, ComponentInitializedEvent tests, attachFormValue(), EventBus (+14 more)

### Community 11 - "Expression Parser"

Cohesion: 0.1
Nodes (13): astCache (module-scoped LRU instance), ExpressionParser, LRUCache, ExpressionParser security test suite, ExpressionParser Tests, resolveHttpRequest(), evaluateHttpValidationResponse(), expressions/parser barrel export (+5 more)

### Community 12 - "Field Definitions (Core)"

Cohesion: 0.07
Nodes (39): ArrayButtonConfig, ArrayComponent, ArrayField, SimplifiedArrayField, BaseCheckedField, CheckedFieldComponent, isCheckedField(), BaseValueField (+31 more)

### Community 13 - "Conditions & Schema Builder"

Cohesion: 0.08
Nodes (40): AsyncConditionFunction, AsyncDerivationFunction, evaluateAndCondition(), evaluateCondition(), evaluateFieldValueCondition(), evaluateJavaScriptExpression(), evaluateOrCondition(), Condition Evaluator Tests (+32 more)

### Community 14 - "Cross-Field Detection"

Cohesion: 0.1
Nodes (39): collectCrossFieldEntries(), collectFromField(), convertBuiltInToCustomValidator(), createEmptyCollection(), CrossFieldCollection, traverseFields(), tryCreateLogicEntry(), tryCreateSchemaEntry() (+31 more)

### Community 15 - "Wrapper Chain & Field Outlet"

Cohesion: 0.07
Nodes (33): create-wrappers type tests, DfFieldOutlet, DfFieldOutlet Directive Spec, EMPTY_OBJECT (frozen), EMPTY_WRAPPERS (frozen sentinel), isSameWrapperChain(), resolveWrappers(), wrapper-chain perf baseline (+25 more)

### Community 16 - "Page Orchestrator & Init Tracking"

Cohesion: 0.08
Nodes (22): ARRAY_EVENT_TYPES const, ArrayAction discriminated union, ArrayEvent union type, observeArrayActions(), toArrayAction(), emitComponentInitialized(), page-orchestrator barrel, createDetailedInitializationTracker() (+14 more)

### Community 17 - "Integration Field Definitions"

Cohesion: 0.08
Nodes (35): ArrayField type tests, ButtonField interface, EventArgs type, CheckboxField interface, ContainerField type tests, DatepickerField interface, DatepickerProps type, datepickerFieldMapper spec (+27 more)

### Community 18 - "Integration Mappers"

Cohesion: 0.09
Nodes (24): checkboxFieldMapper(), checkboxFieldMapper tests, createResolvedErrorsSignal(), resolveErrorMessage(), datepickerFieldMapper(), toDate(), dynamicTextToObservable(), dynamicTextToObservable Spec (+16 more)

### Community 19 - "Simple Test Utilities"

Cohesion: 0.09
Nodes (18): createTestFieldContext(), createTestFormInjector(), TestFieldContextConfig, testMapper(), createMockLogger(), MockLogger interface, provideTestLogger(), testing public_api barrel (+10 more)

### Community 20 - "Form Config Factory & Helpers"

Cohesion: 0.08
Nodes (29): CONTAINER_TYPES constant, createField(), field (alias), createField Spec, FIELD_REGISTRY token, FieldTypeDefinition, CustomFnConfig, formConfig() (+21 more)

### Community 21 - "Container Fields (Group/Array)"

Cohesion: 0.08
Nodes (23): ContainerFieldComponent, ContainerFieldComponent.resolvedFields, ContainerFieldComponent Spec, flushWrapperChain(), TestSectionWrapperComponent, TestStyleWrapperComponent, TestValidationWrapperComponent, ContainerFieldComponent.wrappers (+15 more)

### Community 22 - "Integration Array Button Mappers"

Cohesion: 0.24
Nodes (17): addArrayItemButtonMapper(), insertArrayItemButtonMapper(), popArrayItemButtonMapper(), prependArrayItemButtonMapper(), removeArrayItemButtonMapper(), shiftArrayItemButtonMapper(), Array Button Mappers Tests, buildArrayButtonEventContext() (+9 more)

### Community 23 - "Config Normalization & Validation"

Cohesion: 0.17
Nodes (17): collectFieldData(), config-validator tests, validateFieldTypesRegistered(), validateFormConfig(), validateNoDuplicateKeys(), validateRegexPattern(), buildObjectItem(), buildObjectItemTemplate() (+9 more)

### Community 24 - "Derivation Logger"

Cohesion: 0.19
Nodes (11): formatSkipReason(), logDerivationCycleStart(), logDerivationEvaluation(), logDerivationIteration(), logDerivationSummary(), ActiveDerivationLogger, createDerivationLogger(), createDefaultDerivationLogConfig() (+3 more)

### Community 25 - "Type-Level Field Registry"

Cohesion: 0.12
Nodes (20): DynamicText, AvailableFieldTypes, ContainerFieldTypes, DynamicFormFieldRegistry, ExtractField, FieldRegistryContainers, FieldRegistryLeaves, FieldRegistryWrappers (+12 more)

### Community 26 - "Field Context Registry"

Cohesion: 0.19
Nodes (9): detectArrayScope(), extractFieldState(), FieldContextRegistryService, isChildFieldContext(), FieldContextRegistryService spec suite, core/registry barrel export, RootFormRegistryService, RootFormRegistryService spec suite (+1 more)

### Community 27 - "Library Documentation"

Cohesion: 0.15
Nodes (17): COMPONENT_CACHE token, Field Resolution Pipeline, FormStateMachine (concept), FormStateManager (concept), provideDynamicFormDI Provider Architecture, renderReadyWhen convention, SideEffectScheduler (concept), @ng-forge/dynamic-forms Core Library Docs (+9 more)

### Community 28 - "Expression Evaluator"

Cohesion: 0.22
Nodes (4): BLOCKED_PROPERTIES blacklist, Evaluator, SAFE_METHODS whitelist, Evaluator Tests

### Community 29 - "Submission Integration Tests"

Cohesion: 0.23
Nodes (5): delayedObservable(), errorObservable(), multiEmitObservable(), observableAction(), wrappedAction()

### Community 30 - "Event Bus Tests"

Cohesion: 0.17
Nodes (7): AnotherTestEvent, CustomFormEvent, ErrorEvent, EventWithOptionalArgs, TestEvent, TestEventWithArgs, ThirdTestEvent

### Community 31 - "State Machine Tests"

Cohesion: 0.22
Nodes (5): buildConfig(), createMachine(), createMockLogger(), createFormStateDeps(), initManager()

### Community 32 - "utils: wrapper-chain.spec.ts"

Cohesion: 0.22
Nodes (6): TestHostComponent, TestInputComponent, TestWrapperA, TestWrapperB, TestWrapperBNested, TestWrapperBroken

### Community 33 - "wrappers: RowWrapperComponent"

Cohesion: 0.25
Nodes (6): CssWrapperComponent, CssWrapper type, CssWrapper type tests, RowWrapperComponent, RowWrapper type, RowWrapper type tests

### Community 35 - "utils: resolveField()"

Cohesion: 0.57
Nodes (7): createFieldResolutionPipe(), createRenderReadySignal(), reconcileFields(), ResolvedField (interface), resolveField(), resolveFieldSync(), resolve-field tests

### Community 36 - "wrappers: createWrappers()"

Cohesion: 0.4
Nodes (5): createWrappers(), InferWrapperRegistry<T>, isWrappersBundle(), WrapperRegistration, WrappersBundle

### Community 37 - "core: field-state-extractor.spec.ts"

Cohesion: 0.47
Nodes (4): createMockFieldTree(), createMockFieldTreeAsFunction(), createMockForm(), createMockFormAsFunction()

### Community 40 - "utils: interpolateParams()"

Cohesion: 0.4
Nodes (3): applyMetaToElement(), extractErrorParams(), interpolateParams()

### Community 41 - "pipes: DynamicTextPipe"

Cohesion: 0.33
Nodes (4): DynamicTextPipe, DynamicTextPipe spec, DynamicTextPipe.transform, pipes barrel

### Community 42 - "integration: Page Orchestration Integration"

Cohesion: 0.4
Nodes (6): Signal Forms API Pattern Confirmation tests, Form Mapping Pipeline Integration tests, Hidden Page Auto-Redirect (B15) tests, Page Validity Guard (B2) tests, Page Orchestration Integration test suite, Validator Transformation Pipeline Integration tests

### Community 43 - "mappers: array-button.mapper.spec.ts"

Cohesion: 0.5
Nodes (2): createMockForm(), createMockRegistry()

### Community 45 - "utils: injectFieldRegistry()"

Cohesion: 0.5
Nodes (4): COMPONENT_CACHE injection token, injectFieldRegistry(), loadTypeComponent method, injectFieldRegistry tests

### Community 49 - "utils: inject-field-registry.spec.ts"

Cohesion: 0.5
Nodes (2): AnotherComponent, TestComponent

### Community 50 - "utils: withPreviousValue()"

Cohesion: 0.5
Nodes (3): resource-composition index barrel, withPreviousValue tests, withPreviousValue()

### Community 51 - "utils: createDebouncedSignal()"

Cohesion: 0.83
Nodes (3): createDebouncedEffect(), createDebouncedSignal(), DEFAULT_DEBOUNCE_MS

### Community 53 - "errors: DynamicFormError"

Cohesion: 0.5
Nodes (2): DynamicFormError, Errors Barrel

### Community 54 - "events: event-dispatcher.spec.ts"

Cohesion: 0.5
Nodes (2): TestEvent, TestEventWithPayload

### Community 55 - "integration: SignalFormsAdapterService Unit"

Cohesion: 0.5
Nodes (4): Button Logic Integration tests, Logic Transformation Integration tests, SignalFormsAdapterService Unit tests, Signal Forms Integration tests

### Community 60 - "core: render-ready-metadata.spec.ts"

Cohesion: 0.67
Nodes (1): TestRequiredFieldComponent

### Community 62 - "core: validator-factory.spec.ts"

Cohesion: 1.0
Nodes (2): getCapturedOptions(), setupAndCapture()

### Community 64 - "fields: TextFieldComponent"

Cohesion: 0.67
Nodes (2): TextFieldComponent Spec, TextFieldComponent

### Community 65 - "models: RowAllowedChildren"

Cohesion: 0.67
Nodes (3): ContainerAllowedChildren, PageAllowedChildren, RowAllowedChildren

### Community 66 - "providers: provideDynamicForm type tests"

Cohesion: 1.0
Nodes (3): ExtractFieldDefs, ExtractFormValue, provideDynamicForm type tests

### Community 80 - "TestClass"

Cohesion: 1.0
Nodes (1): TestClass

### Community 83 - "text-field.component.spec.ts"

Cohesion: 1.0
Nodes (1): TestHostComponent

### Community 90 - "ArrayItemDefinition"

Cohesion: 1.0
Nodes (2): ArrayItemDefinition, ArrayItemTemplate

### Community 91 - "array-event-handler tests"

Cohesion: 1.0
Nodes (2): array-event-handler tests, wrapper-chain module

### Community 92 - "dynamic-forms vite config (browser mode)"

Cohesion: 1.0
Nodes (2): dynamic-forms vite config (browser mode), dynamic-forms vite typecheck config

### Community 298 - "Gotcha: Firefox E2E flakiness"

Cohesion: 1.0
Nodes (1): Gotcha: Firefox E2E flakiness

### Community 299 - "dynamic-forms ESLint config"

Cohesion: 1.0
Nodes (1): dynamic-forms ESLint config

### Community 300 - "TextareaProps interface"

Cohesion: 1.0
Nodes (1): TextareaProps interface

### Community 301 - "TextareaWrap type"

Cohesion: 1.0
Nodes (1): TextareaWrap type

### Community 302 - "BaseArrayAddButtonField"

Cohesion: 1.0
Nodes (1): BaseArrayAddButtonField

### Community 303 - "BaseArrayRemoveButtonField"

Cohesion: 1.0
Nodes (1): BaseArrayRemoveButtonField

### Community 304 - "dynamic-forms package barrel"

Cohesion: 1.0
Nodes (1): dynamic-forms package barrel

### Community 305 - "CrossFieldCategory"

Cohesion: 1.0
Nodes (1): CrossFieldCategory

### Community 306 - "ARRAY_PLACEHOLDER (.$.)"

Cohesion: 1.0
Nodes (1): ARRAY_PLACEHOLDER (.$.)

### Community 307 - "MAX_AST_CACHE_SIZE (=1000)"

Cohesion: 1.0
Nodes (1): MAX_AST_CACHE_SIZE (=1000)

### Community 308 - "DERIVATION_KEY_DELIMITER (\x00)"

Cohesion: 1.0
Nodes (1): DERIVATION_KEY_DELIMITER (\x00)

### Community 309 - "DerivationChainContext"

Cohesion: 1.0
Nodes (1): DerivationChainContext

### Community 310 - "DerivationProcessingResult"

Cohesion: 1.0
Nodes (1): DerivationProcessingResult

### Community 311 - "CycleDetectionResult"

Cohesion: 1.0
Nodes (1): CycleDetectionResult

### Community 312 - "DerivationApplicatorContext"

Cohesion: 1.0
Nodes (1): DerivationApplicatorContext

### Community 313 - "HttpDerivationStreamContext"

Cohesion: 1.0
Nodes (1): HttpDerivationStreamContext

### Community 314 - "AsyncDerivationStreamContext"

Cohesion: 1.0
Nodes (1): AsyncDerivationStreamContext

### Community 315 - "derivation-collector tests"

Cohesion: 1.0
Nodes (1): derivation-collector tests

### Community 316 - "async-derivation-stream tests"

Cohesion: 1.0
Nodes (1): async-derivation-stream tests

### Community 317 - "http-request-resolver tests"

Cohesion: 1.0
Nodes (1): http-request-resolver tests

### Community 318 - "http-response-evaluator tests"

Cohesion: 1.0
Nodes (1): http-response-evaluator tests

### Community 319 - "CustomFunctionOptions"

Cohesion: 1.0
Nodes (1): CustomFunctionOptions

### Community 320 - "CustomFunctionScope type"

Cohesion: 1.0
Nodes (1): CustomFunctionScope type

### Community 321 - "property-derivation-types spec suite"

Cohesion: 1.0
Nodes (1): property-derivation-types spec suite

### Community 322 - "property-override-key spec suite"

Cohesion: 1.0
Nodes (1): property-override-key spec suite

### Community 323 - "NextPageEvent tests"

Cohesion: 1.0
Nodes (1): NextPageEvent tests

### Community 324 - "PreviousPageEvent tests"

Cohesion: 1.0
Nodes (1): PreviousPageEvent tests

### Community 325 - "MoveArrayItemEvent tests"

Cohesion: 1.0
Nodes (1): MoveArrayItemEvent tests

### Community 326 - "SubmitEvent tests"

Cohesion: 1.0
Nodes (1): SubmitEvent tests

### Community 327 - "fields/index.ts barrel"

Cohesion: 1.0
Nodes (1): fields/index.ts barrel

### Community 328 - "WithInputSignals"

Cohesion: 1.0
Nodes (1): WithInputSignals

### Community 329 - "FieldOption"

Cohesion: 1.0
Nodes (1): FieldOption

### Community 330 - "FieldWrapperContract"

Cohesion: 1.0
Nodes (1): FieldWrapperContract

### Community 331 - "GroupAllowedChildren"

Cohesion: 1.0
Nodes (1): GroupAllowedChildren

### Community 332 - "ArrayAllowedChildren"

Cohesion: 1.0
Nodes (1): ArrayAllowedChildren

### Community 333 - "FormMode type"

Cohesion: 1.0
Nodes (1): FormMode type

### Community 334 - "FieldPathAccess"

Cohesion: 1.0
Nodes (1): FieldPathAccess

### Community 335 - "LogicTrigger"

Cohesion: 1.0
Nodes (1): LogicTrigger

### Community 336 - "validation models barrel"

Cohesion: 1.0
Nodes (1): validation models barrel

### Community 337 - "omit / keyBy / mapValues helpers"

Cohesion: 1.0
Nodes (1): omit / keyBy / mapValues helpers

### Community 338 - "createResolvedErrorsSignal Spec"

Cohesion: 1.0
Nodes (1): createResolvedErrorsSignal Spec

### Community 339 - "deprecation-warnings Spec"

Cohesion: 1.0
Nodes (1): deprecation-warnings Spec

### Community 340 - "shouldShowErrors tests"

Cohesion: 1.0
Nodes (1): shouldShowErrors tests

### Community 341 - "utils/index barrel"

Cohesion: 1.0
Nodes (1): utils/index barrel

### Community 342 - "object-utils tests"

Cohesion: 1.0
Nodes (1): object-utils tests

### Community 343 - "interpolateParams tests"

Cohesion: 1.0
Nodes (1): interpolateParams tests

### Community 344 - "applyMetaToElement tests"

Cohesion: 1.0
Nodes (1): applyMetaToElement tests

### Community 345 - "resolve-wrappers tests"

Cohesion: 1.0
Nodes (1): resolve-wrappers tests

### Community 346 - "Form Submission Integration tests"

Cohesion: 1.0
Nodes (1): Form Submission Integration tests

### Community 347 - "ng-forge Dynamic Forms Logo"

Cohesion: 1.0
Nodes (1): ng-forge Dynamic Forms Logo

## Ambiguous Edges - Review These

- `Integration public API` → `Schema entrypoint` [AMBIGUOUS]
  packages/dynamic-forms/schema/index.ts · relation: semantically_similar_to
- `FormEvent interface` → `HiddenField tests` [AMBIGUOUS]
  packages/dynamic-forms/src/lib/fields/hidden/hidden-field.spec.ts · relation: conceptually_related_to

## Knowledge Gaps

- **284 isolated node(s):** `TestParentWrapperComponent`, `TestChildWrapperComponent`, `TestArrayContextWrapperComponent`, `TestRequiredKeyComponent`, `TestSectionWrapper` (+279 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `mappers: array-button.mapper.spec.ts`** (5 nodes): `createMockForm()`, `createMockRegistry()`, `createTestInjector()`, `runMapper()`, `array-button.mapper.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `utils: inject-field-registry.spec.ts`** (4 nodes): `AnotherComponent`, `loadComponentFn()`, `TestComponent`, `inject-field-registry.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `errors: DynamicFormError`** (4 nodes): `DynamicFormError`, `.constructor()`, `Errors Barrel`, `dynamic-form-error.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `events: event-dispatcher.spec.ts`** (4 nodes): `TestEvent`, `TestEventWithPayload`, `.constructor()`, `event-dispatcher.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `core: render-ready-metadata.spec.ts`** (3 nodes): `delayedFieldMapper()`, `TestRequiredFieldComponent`, `render-ready-metadata.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `core: validator-factory.spec.ts`** (3 nodes): `validator-factory.spec.ts`, `getCapturedOptions()`, `setupAndCapture()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `fields: TextFieldComponent`** (3 nodes): `text-field.component.ts`, `TextFieldComponent Spec`, `TextFieldComponent`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `TestClass`** (2 nodes): `TestClass`, `derived-from-deferred.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `text-field.component.spec.ts`** (2 nodes): `text-field.component.spec.ts`, `TestHostComponent`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ArrayItemDefinition`** (2 nodes): `ArrayItemDefinition`, `ArrayItemTemplate`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `array-event-handler tests`** (2 nodes): `array-event-handler tests`, `wrapper-chain module`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `dynamic-forms vite config (browser mode)`** (2 nodes): `dynamic-forms vite config (browser mode)`, `dynamic-forms vite typecheck config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Gotcha: Firefox E2E flakiness`** (1 nodes): `Gotcha: Firefox E2E flakiness`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `dynamic-forms ESLint config`** (1 nodes): `dynamic-forms ESLint config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `TextareaProps interface`** (1 nodes): `TextareaProps interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `TextareaWrap type`** (1 nodes): `TextareaWrap type`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BaseArrayAddButtonField`** (1 nodes): `BaseArrayAddButtonField`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BaseArrayRemoveButtonField`** (1 nodes): `BaseArrayRemoveButtonField`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `dynamic-forms package barrel`** (1 nodes): `dynamic-forms package barrel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CrossFieldCategory`** (1 nodes): `CrossFieldCategory`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ARRAY_PLACEHOLDER (.$.)`** (1 nodes): `ARRAY_PLACEHOLDER (.$.)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MAX_AST_CACHE_SIZE (=1000)`** (1 nodes): `MAX_AST_CACHE_SIZE (=1000)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DERIVATION_KEY_DELIMITER (\x00)`** (1 nodes): `DERIVATION_KEY_DELIMITER (\x00)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DerivationChainContext`** (1 nodes): `DerivationChainContext`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DerivationProcessingResult`** (1 nodes): `DerivationProcessingResult`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CycleDetectionResult`** (1 nodes): `CycleDetectionResult`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DerivationApplicatorContext`** (1 nodes): `DerivationApplicatorContext`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `HttpDerivationStreamContext`** (1 nodes): `HttpDerivationStreamContext`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AsyncDerivationStreamContext`** (1 nodes): `AsyncDerivationStreamContext`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `derivation-collector tests`** (1 nodes): `derivation-collector tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `async-derivation-stream tests`** (1 nodes): `async-derivation-stream tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `http-request-resolver tests`** (1 nodes): `http-request-resolver tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `http-response-evaluator tests`** (1 nodes): `http-response-evaluator tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CustomFunctionOptions`** (1 nodes): `CustomFunctionOptions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CustomFunctionScope type`** (1 nodes): `CustomFunctionScope type`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `property-derivation-types spec suite`** (1 nodes): `property-derivation-types spec suite`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `property-override-key spec suite`** (1 nodes): `property-override-key spec suite`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `NextPageEvent tests`** (1 nodes): `NextPageEvent tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PreviousPageEvent tests`** (1 nodes): `PreviousPageEvent tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MoveArrayItemEvent tests`** (1 nodes): `MoveArrayItemEvent tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SubmitEvent tests`** (1 nodes): `SubmitEvent tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `fields/index.ts barrel`** (1 nodes): `fields/index.ts barrel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `WithInputSignals`** (1 nodes): `WithInputSignals`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `FieldOption`** (1 nodes): `FieldOption`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `FieldWrapperContract`** (1 nodes): `FieldWrapperContract`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GroupAllowedChildren`** (1 nodes): `GroupAllowedChildren`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ArrayAllowedChildren`** (1 nodes): `ArrayAllowedChildren`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `FormMode type`** (1 nodes): `FormMode type`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `FieldPathAccess`** (1 nodes): `FieldPathAccess`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `LogicTrigger`** (1 nodes): `LogicTrigger`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `validation models barrel`** (1 nodes): `validation models barrel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `omit / keyBy / mapValues helpers`** (1 nodes): `omit / keyBy / mapValues helpers`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `createResolvedErrorsSignal Spec`** (1 nodes): `createResolvedErrorsSignal Spec`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `deprecation-warnings Spec`** (1 nodes): `deprecation-warnings Spec`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `shouldShowErrors tests`** (1 nodes): `shouldShowErrors tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `utils/index barrel`** (1 nodes): `utils/index barrel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `object-utils tests`** (1 nodes): `object-utils tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `interpolateParams tests`** (1 nodes): `interpolateParams tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `applyMetaToElement tests`** (1 nodes): `applyMetaToElement tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `resolve-wrappers tests`** (1 nodes): `resolve-wrappers tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Form Submission Integration tests`** (1 nodes): `Form Submission Integration tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ng-forge Dynamic Forms Logo`** (1 nodes): `ng-forge Dynamic Forms Logo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Integration public API` and `Schema entrypoint`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `FormEvent interface` and `HiddenField tests`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `createComponent()` connect `Provider Wiring & Wrapper Injection` to `Wrapper Chain & Field Outlet`, `Test Harnesses & DynamicFormTestUtils`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `applyLogic()` connect `Logic Expressions & Conditionals` to `Validator Factory & Dynamic Values`, `Field Tree Mapping`, `Function Registry & Logic Functions`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `NoopLogger` connect `Provider Wiring & Wrapper Injection` to `Derivation Logger`, `Validator Factory & Dynamic Values`, `Array/Page Field Components`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FunctionRegistryService` (e.g. with `FieldContextRegistryService` and `SchemaRegistryService`) actually correct?**
  _`FunctionRegistryService` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TestParentWrapperComponent`, `TestChildWrapperComponent`, `TestArrayContextWrapperComponent` to the rest of the system?**
  _284 weakly-connected nodes found - possible documentation gaps or missing edges._
