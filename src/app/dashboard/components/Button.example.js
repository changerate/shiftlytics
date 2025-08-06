// Example usage of the Button component
import Button from './Button';

export default function ButtonExamples() {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Button Component Examples</h1>
      
      {/* Variants */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" onClick={handleClick}>
            Primary
          </Button>
          <Button variant="secondary" onClick={handleClick}>
            Secondary
          </Button>
          <Button variant="outline" onClick={handleClick}>
            Outline
          </Button>
          <Button variant="danger" onClick={handleClick}>
            Danger
          </Button>
          <Button variant="success" onClick={handleClick}>
            Success
          </Button>
          <Button variant="ghost" onClick={handleClick}>
            Ghost
          </Button>
        </div>
      </section>

      {/* Sizes */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="small" onClick={handleClick}>
            Small
          </Button>
          <Button size="medium" onClick={handleClick}>
            Medium
          </Button>
          <Button size="large" onClick={handleClick}>
            Large
          </Button>
        </div>
      </section>

      {/* States */}
      <section>
        <h2 className="text-lg font-semibold mb-4">States</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleClick}>
            Normal
          </Button>
          <Button disabled>
            Disabled
          </Button>
        </div>
      </section>

      {/* With Icons (example using text icons) */}
      <section>
        <h2 className="text-lg font-semibold mb-4">With Content</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleClick}>
            + Add Employee
          </Button>
          <Button variant="outline" onClick={handleClick}>
            📊 View Reports
          </Button>
          <Button variant="danger" onClick={handleClick}>
            🗑️ Delete
          </Button>
        </div>
      </section>
    </div>
  );
}
