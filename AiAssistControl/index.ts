import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { AiAssistField } from "./components/AiAssistField";
import * as React from "react";
import * as ReactDOM from "react-dom";

export class AiAssistControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private container: HTMLDivElement;
  private notifyOutputChanged: () => void;
  private currentValue: string = "";
  private context: ComponentFramework.Context<IInputs>;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.container = container;
    this.notifyOutputChanged = notifyOutputChanged;
    this.context = context;
    this.currentValue = context.parameters.value.raw || "";
    this.renderControl(context);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this.context = context;
    this.renderControl(context);
  }

  private renderControl(context: ComponentFramework.Context<IInputs>): void {
    const props = {
      value: this.currentValue,
      placeholder: context.parameters.placeholder?.raw || "",
      aiInstruction: context.parameters.aiInstruction?.raw || "Improve this text",
      apiKey: context.parameters.apiKey?.raw || "",
      disabled: context.mode.isControlDisabled,
      onChange: (newValue: string) => {
        this.currentValue = newValue;
        this.notifyOutputChanged();
        this.renderControl(this.context);
      },
    };

    ReactDOM.render(React.createElement(AiAssistField, props), this.container);
  }

  public getOutputs(): IOutputs {
    return {
      value: this.currentValue,
    };
  }

  public destroy(): void {
    ReactDOM.unmountComponentAtNode(this.container);
  }
}
