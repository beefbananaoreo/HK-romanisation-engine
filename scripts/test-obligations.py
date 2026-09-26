"""Mutation regressions for static obligation integrity; no renderer is executed."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]


class ObligationIntegrityTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix='hklang-obligations-')
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        for relative in (
            'scripts/check-obligations.py',
            'obligations/case-fixtures.json',
            'obligations/coverage-map.json',
            'evidence/obligations-materialisation.json',
            'spec/HKLanguageLabPacket-v1.7.md',
        ):
            target = self.root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, target)

    def mutate(self, relative, mutation):
        path = self.root / relative
        document = json.loads(path.read_text(encoding='utf-8'))
        mutation(document)
        path.write_text(json.dumps(document), encoding='utf-8', newline='\n')

    def run_checker(self, *flags, optimize=None):
        environment = dict(os.environ)
        environment.pop('PYTHONOPTIMIZE', None)
        if optimize is not None:
            environment['PYTHONOPTIMIZE'] = optimize
        return subprocess.run(
            [sys.executable, *flags, str(self.root / 'scripts/check-obligations.py')],
            cwd=self.root, env=environment, capture_output=True,
            text=True, encoding='utf-8', timeout=20,
        )

    def assert_rejected(self, message):
        result = self.run_checker()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(message, result.stderr)
        self.assertNotIn('STATIC_MATERIALISATION_INTEGRITY_PASS', result.stdout)

    def test_current_artifacts_preserve_recorded_evidence(self):
        result = self.run_checker()
        self.assertEqual(result.returncode, 0, result.stderr)
        expected = (self.root / 'evidence/obligations-materialisation.json').read_text(encoding='utf-8')
        self.assertEqual(result.stdout, expected)

    def test_dangling_rendering_reference(self):
        self.mutate('obligations/coverage-map.json', lambda data:
                    data['rows'][0]['subObligations'][1]['caseIds'].__setitem__(0, 'DOES-NOT-EXIST'))
        self.assert_rejected('Unknown rendering case reference')

    def test_duplicate_coverage_gate(self):
        self.mutate('obligations/coverage-map.json', lambda data:
                    data['rows'][0].__setitem__('id', data['rows'][1]['id']))
        self.assert_rejected('Duplicate coverage row IDs')

    def test_unknown_gate_replacing_required_gate(self):
        self.mutate('obligations/coverage-map.json', lambda data:
                    data['rows'][0].__setitem__('id', 'T-NOT-IN-SCOPE'))
        self.assert_rejected('Coverage row IDs differ')

    def test_mismatched_authority_sources(self):
        self.mutate('obligations/coverage-map.json', lambda data:
                    data['authority'].__setitem__('sha256', '0' * 64))
        self.assert_rejected('Fixture authority metadata differs')

    def test_both_authority_hashes_must_match_actual_packet(self):
        for relative in ('obligations/coverage-map.json', 'obligations/case-fixtures.json'):
            self.mutate(relative, lambda data: data['authority'].__setitem__('sha256', '0' * 64))
        self.assert_rejected('Authority packet SHA-256 differs')

    def test_both_authority_sizes_must_match_actual_packet(self):
        for relative in ('obligations/coverage-map.json', 'obligations/case-fixtures.json'):
            self.mutate(relative, lambda data: data['authority'].__setitem__('bytes', 1))
        self.assert_rejected('Authority packet byte count differs')

    def test_same_length_packet_edit_changes_authority(self):
        path = self.root / 'spec/HKLanguageLabPacket-v1.7.md'
        packet = path.read_bytes()
        path.write_bytes(bytes([packet[0] ^ 1]) + packet[1:])
        self.assert_rejected('Authority packet SHA-256 differs')

    def test_dangling_structural_reference(self):
        self.mutate('obligations/coverage-map.json', lambda data:
                    data['rows'][0]['subObligations'][0]['obligationIds'].__setitem__(0, 'MISSING'))
        self.assert_rejected('Unknown structural obligation reference')

    def test_cross_runtime_cases_cannot_omit_a_case_by_duplication(self):
        self.mutate('obligations/case-fixtures.json', lambda data:
                    data['crossRuntimeObligation']['coversCaseIds'].__setitem__(0, data['renderingCases'][1]['id']))
        self.assert_rejected('Cross-runtime case coverage differs')

    def test_optimized_python_never_reports_integrity_pass(self):
        for flags, optimize in ((['-O'], None), ([], '1')):
            with self.subTest(flags=flags, optimize=optimize):
                result = self.run_checker(*flags, optimize=optimize)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('require assertions', result.stderr)
                self.assertNotIn('STATIC_MATERIALISATION_INTEGRITY_PASS', result.stdout)


if __name__ == '__main__':
    unittest.main()
